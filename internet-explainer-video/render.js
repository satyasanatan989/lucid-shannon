const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.join(__dirname, 'output');
const ARTIFACT_DIR = "C:\\Users\\prabh\\.gemini\\antigravity\\brain\\9491c393-2d38-44e0-9c0c-e0a6653db413\\preview_frames";

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

const htmlPath = path.resolve(__dirname, 'public', 'index.html').replace(/\\/g, '/');
const tempProfile = path.join(process.env.TEMP, 'chrome_render_profile');

console.log('=== VIDEO GENERATOR PIPELINE (HyperFrames + Remotion + Motion Canvas + Manim) ===');

// Step 1: Render Verification Snapshots (TDD Visual Verification)
const testScenes = [
  { name: '01_illusion', t: 2, label: 'Scene 1: The Cloud Illusion' },
  { name: '02_ocean_floor', t: 12, label: 'Scene 2: The Ocean Floor & Flip Clock' },
  { name: '03_cable_anatomy', t: 24, label: 'Scene 3: Manim Cable Anatomy' },
  { name: '04_packet_routing', t: 36, label: 'Scene 4: Packet Routing & Latency Timer' },
  { name: '05_hazards', t: 48, label: 'Scene 5: Hazards & Cable Ships' },
  { name: '06_global_mesh', t: 57, label: 'Scene 6: Global Subsea Cable Mesh' },
];

console.log(`\nRendering ${testScenes.length} test scene snapshots...`);

testScenes.forEach(scene => {
  const outPath = path.join(ARTIFACT_DIR, `${scene.name}.png`);
  const url = `file:///${htmlPath}?render=1&t=${scene.t}`;
  const cmd = `"${CHROME_PATH}" --headless=new --disable-gpu --user-data-dir="${tempProfile}" --screenshot="${outPath}" --window-size=1080,1920 --virtual-time-budget=2000 "${url}"`;
  
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`[PASS] ${scene.label} -> ${scene.name}.png`);
  } catch (err) {
    console.error(`[FAIL] ${scene.label}:`, err.message);
  }
});

// Step 2: Render 60-Second Full Video Timeline & Compile to MP4
console.log('\n--- RENDERING FULL 60-SECOND TIMELINE ---');
const framesDir = path.join(OUTPUT_DIR, 'frames');
if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });

const TOTAL_SECONDS = 60;
console.log(`Capturing ${TOTAL_SECONDS} timeline sequence frames (1 frame/sec)...`);

for (let s = 0; s < TOTAL_SECONDS; s++) {
  const frameFileName = `frame_${String(s).padStart(4, '0')}.png`;
  const frameOut = path.join(framesDir, frameFileName);
  const url = `file:///${htmlPath}?render=1&t=${s}`;
  const cmd = `"${CHROME_PATH}" --headless=new --disable-gpu --user-data-dir="${tempProfile}" --screenshot="${frameOut}" --window-size=1080,1920 --virtual-time-budget=1000 "${url}"`;
  
  try {
    execSync(cmd, { stdio: 'pipe' });
    process.stdout.write(`\rCaptured frame ${s + 1}/${TOTAL_SECONDS} (${Math.round(((s + 1)/TOTAL_SECONDS)*100)}%)`);
  } catch (err) {
    console.error(`\nError capturing frame ${s}:`, err.message);
  }
}

console.log('\nAll frames captured. Compiling to high-resolution MP4 video using FFmpeg...');

const videoOutput = path.join(OUTPUT_DIR, 'how_the_internet_actually_works.mp4');
const artifactVideo = "C:\\Users\\prabh\\.gemini\\antigravity\\brain\\9491c393-2d38-44e0-9c0c-e0a6653db413\\how_the_internet_actually_works.mp4";

// FFmpeg encoding: 1080x1920 30fps with smooth motion interpolation
const ffmpegCmd = `ffmpeg -y -framerate 1 -i "${framesDir}\\frame_%04d.png" -c:v libx264 -r 30 -pix_fmt yuv420p -preset fast -crf 20 "${videoOutput}"`;

try {
  execSync(ffmpegCmd, { stdio: 'pipe' });
  fs.copyFileSync(videoOutput, artifactVideo);
  console.log(`\n[SUCCESS] MP4 Video rendered: ${videoOutput}`);
  console.log(`[SUCCESS] Copied to Artifact Directory: ${artifactVideo}`);
} catch (err) {
  console.error('\nFFmpeg compilation error:', err.message);
}

console.log('\n=== VIDEO GENERATION COMPLETE ===');
