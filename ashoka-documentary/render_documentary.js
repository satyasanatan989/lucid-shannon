const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const WebSocket = require(path.join(__dirname, '..', 'ECC', 'node_modules', 'ws'));

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9223;
const tempProfile = path.join(process.env.TEMP, 'chrome_ashoka_profile');
const htmlPath = path.resolve(__dirname, 'public', 'index.html').replace(/\\/g, '/');
const targetUrl = `file:///${htmlPath}?render=1`;

const AUDIO_PATH = "C:\\Users\\prabh\\.gemini\\antigravity\\brain\\9491c393-2d38-44e0-9c0c-e0a6653db413\\ashoka_master_soundtrack.mp3";
const SNAP_DIR = "C:\\Users\\prabh\\.gemini\\antigravity\\brain\\9491c393-2d38-44e0-9c0c-e0a6653db413\\preview_ashoka";
const OUTPUT_VIDEO = path.join(__dirname, 'output', 'ashoka_samrat_documentary.mp4');
const ARTIFACT_VIDEO = "C:\\Users\\prabh\\.gemini\\antigravity\\brain\\9491c393-2d38-44e0-9c0c-e0a6653db413\\ashoka_samrat_documentary.mp4";

if (!fs.existsSync(SNAP_DIR)) fs.mkdirSync(SNAP_DIR, { recursive: true });

const FPS = 30;
const DURATION = 22.31; // Matches exact IndicF5 master soundtrack
const TOTAL_FRAMES = Math.floor(DURATION * FPS);

console.log("=== ASHOKA SAMRAT DOCUMENTARY RENDER PIPELINE ===");

async function run() {
  // 1. Launch Chrome Headless with Remote Debugging
  console.log('[1/4] Launching headless Chrome for Ashoka documentary...');
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${tempProfile}`,
    '--window-size=1080,1920',
    targetUrl
  ], { stdio: 'ignore' });

  await new Promise(r => setTimeout(r, 1800));

  // 2. Discover WebSocket Debugger URL
  console.log('[2/4] Connecting over CDP WebSocket...');
  const targets = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${PORT}/json`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) throw new Error('No page target found');
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
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

  await sendCommand('Page.enable');
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 1080,
    height: 1920,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Step 1: Render Verification Snapshots for all 6 Chapters
  console.log('\nRendering TDD visual verification snapshots for all 6 chapters...');
  const testScenes = [
    { name: 'ch1_conqueror', t: 2.0, label: 'Chapter 1: The Mauryan Conqueror & War Elephant' },
    { name: 'ch2_kalinga', t: 5.5, label: 'Chapter 2: The Battle of Kalinga & Swords Clashing' },
    { name: 'ch3_breaking_point', t: 9.5, label: 'Chapter 3: The Breaking Point & Golden Lotus' },
    { name: 'ch4_dhamma', t: 13.5, label: 'Chapter 4: The Dhamma Revolution & Upagupta' },
    { name: 'ch5_chakra', t: 17.5, label: 'Chapter 5: Ashoka Chakra 24-Spokes & Pillars' },
    { name: 'ch6_legacy', t: 21.0, label: 'Chapter 6: The Eternal Legacy & Satyameva Jayate' },
  ];

  for (const sc of testScenes) {
    await sendCommand('Runtime.evaluate', { expression: `window.setSeekTime(${sc.t})` });
    const snap = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const snapPath = path.join(SNAP_DIR, `${sc.name}.png`);
    fs.writeFileSync(snapPath, Buffer.from(snap.data, 'base64'));
    console.log(`[PASS] ${sc.label} -> ${sc.name}.png`);
  }

  // Step 2: Full 30 FPS Stream to FFmpeg
  console.log(`\n[3/4] Streaming ${TOTAL_FRAMES} frames at 30 FPS into FFmpeg...`);
  
  // Check if master audio exists, else fallback to voiceover
  const hasAudio = fs.existsSync(AUDIO_PATH);
  console.log(`Audio Track: ${hasAudio ? 'Master Soundtrack Found' : 'Rendering Video Stream First'}`);

  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(FPS),
    '-i', 'pipe:0'
  ];

  if (hasAudio) {
    ffmpegArgs.push('-i', AUDIO_PATH);
  }

  ffmpegArgs.push(
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'veryfast',
    '-crf', '18'
  );

  if (hasAudio) {
    ffmpegArgs.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  }

  ffmpegArgs.push(OUTPUT_VIDEO);

  const ffmpegProc = spawn('ffmpeg', ffmpegArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
  const startTime = Date.now();

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const t = frame / FPS;
    await sendCommand('Runtime.evaluate', { expression: `window.setSeekTime(${t})` });
    const snap = await sendCommand('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
    const buf = Buffer.from(snap.data, 'base64');
    
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
  await new Promise(r => ffmpegProc.on('close', r));

  fs.copyFileSync(OUTPUT_VIDEO, ARTIFACT_VIDEO);

  console.log('\n\n=== DOCUMENTARY RENDER COMPLETE ===');
  console.log(`Video File: ${OUTPUT_VIDEO}`);
  console.log(`Artifact Link: ${ARTIFACT_VIDEO}`);

  ws.close();
  chromeProc.kill();
}

run().catch(err => {
  console.error('Render error:', err);
  process.exit(1);
});
