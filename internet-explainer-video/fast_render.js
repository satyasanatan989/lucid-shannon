const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Use ws from ECC node_modules
const WebSocket = require(path.join(__dirname, '..', 'ECC', 'node_modules', 'ws'));

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const tempProfile = path.join(process.env.TEMP, 'chrome_cdp_profile');
const htmlPath = path.resolve(__dirname, 'public', 'index.html').replace(/\\/g, '/');
const targetUrl = `file:///${htmlPath}?render=1`;

const AUDIO_PATH = "C:\\Users\\prabh\\.gemini\\antigravity\\brain\\9491c393-2d38-44e0-9c0c-e0a6653db413\\master_soundtrack.mp3";
const OUTPUT_VIDEO = path.join(__dirname, 'output', 'how_the_internet_actually_works_smooth.mp4');
const ARTIFACT_VIDEO = "C:\\Users\\prabh\\.gemini\\antigravity\\brain\\9491c393-2d38-44e0-9c0c-e0a6653db413\\how_the_internet_actually_works_smooth.mp4";

const FPS = 30;
const DURATION = 39.36; // Exact match to master voiceover
const TOTAL_FRAMES = Math.floor(DURATION * FPS);

console.log(`=== FAST 30 FPS RENDERER (CDP PIPE + AUDIO SYNC) ===`);
console.log(`Target: ${TOTAL_FRAMES} frames at 1080x1920 @ ${FPS} fps (~${DURATION}s)`);

async function run() {
  // 1. Launch Chrome with Remote Debugging
  console.log('[1/4] Launching headless Chrome with CDP...');
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${tempProfile}`,
    '--window-size=1080,1920',
    targetUrl
  ], { stdio: 'ignore' });

  // Wait 1.5s for Chrome to initialize port
  await new Promise(r => setTimeout(r, 1500));

  // 2. Discover WebSocket Debugger URL
  console.log('[2/4] Connecting to Chrome DevTools Protocol...');
  const targets = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${PORT}/json`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) throw new Error('No page target found');
  const wsUrl = pageTarget.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });

  let idCounter = 1;
  const pendingRequests = new Map();

  ws.on('message', raw => {
    const msg = JSON.parse(raw);
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  });

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Setup viewport & page
  await sendCommand('Page.enable');
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 1080,
    height: 1920,
    deviceScaleFactor: 1,
    mobile: false
  });

  // 3. Spawn FFmpeg with image pipe input & synchronized audio
  console.log('[3/4] Starting FFmpeg pipe encoder with synchronized master audio...');
  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(FPS),
    '-i', 'pipe:0',
    '-i', AUDIO_PATH,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'veryfast',
    '-crf', '18',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    OUTPUT_VIDEO
  ];

  const ffmpegProc = spawn('ffmpeg', ffmpegArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

  ffmpegProc.on('error', err => {
    console.error('FFmpeg process error:', err);
  });

  // 4. Render and stream every frame directly into FFmpeg
  console.log(`[4/4] Streaming ${TOTAL_FRAMES} frames into FFmpeg at 30 FPS...`);
  const startTime = Date.now();

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const t = frame / FPS;
    
    // Seek timeline deterministically
    await sendCommand('Runtime.evaluate', {
      expression: `window.setSeekTime(${t})`
    });

    // Capture JPEG frame from memory
    const snap = await sendCommand('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 92
    });

    const buf = Buffer.from(snap.data, 'base64');
    
    // Write buffer directly to ffmpeg pipe
    const canWrite = ffmpegProc.stdin.write(buf);
    if (!canWrite) {
      await new Promise(r => ffmpegProc.stdin.once('drain', r));
    }

    if (frame % 30 === 0 || frame === TOTAL_FRAMES - 1) {
      const pct = Math.round(((frame + 1) / TOTAL_FRAMES) * 100);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(`\rRendered ${frame + 1}/${TOTAL_FRAMES} frames (${pct}%) in ${elapsed}s [${(frame / elapsed).toFixed(1)} fps]`);
    }
  }

  ffmpegProc.stdin.end();

  // Wait for FFmpeg to finish encoding
  await new Promise(r => ffmpegProc.on('close', r));

  // Copy to Brain artifact directory
  fs.copyFileSync(OUTPUT_VIDEO, ARTIFACT_VIDEO);

  console.log('\n\n=== RENDER COMPLETE ===');
  console.log(`Smooth Video Output: ${OUTPUT_VIDEO}`);
  console.log(`Artifact Output: ${ARTIFACT_VIDEO}`);

  // Cleanup Chrome
  ws.close();
  chromeProc.kill();
}

run().catch(err => {
  console.error('Render error:', err);
  process.exit(1);
});
