const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const ROOT = path.join(__dirname);

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  // Endpoint to save recorded video from browser MediaRecorder
  if (req.method === 'POST' && req.url === '/save-recording') {
    const outDir = path.join(ROOT, 'output');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'smooth_recorded.webm');
    const writeStream = fs.createWriteStream(outPath);
    req.pipe(writeStream);
    req.on('end', () => {
      console.log(`[Recorder Server] 60fps WebM saved to: ${outPath}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', path: outPath }));
    });
    return;
  }

  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/public/index.html';

  // Support serving audio files from brain artifact dir
  let filePath;
  if (reqPath.startsWith('/audio/')) {
    filePath = path.join("C:\\Users\\prabh\\.gemini\\antigravity\\brain\\9491c393-2d38-44e0-9c0c-e0a6653db413", reqPath.replace('/audio/', ''));
  } else {
    filePath = path.join(ROOT, reqPath);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + reqPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`[Studio Server] Running at http://localhost:${PORT}/public/index.html`);
});
