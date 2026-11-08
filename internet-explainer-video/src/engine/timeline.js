// Master Timeline & Animation Engine (Remotion & HyperFrames Paradigm)
(function() {
  const TOTAL_DURATION = 39.36; // Exact voiceover length (39.36s)
  let currentTime = 0.0;
  let isPlaying = false;
  let lastTimestamp = null;

  // DOM Elements
  const stage = document.getElementById('stage-container');
  const scrubber = document.getElementById('timeline-scrubber');
  const timecode = document.getElementById('timecode');
  const btnPlay = document.getElementById('btn-play');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const engineBadge = document.getElementById('engine-badge');
  const masterAudio = document.getElementById('master-audio');

  const scenes = [
    { id: 'scene-1', start: 0, end: 5.5, engine: 'HyperFrames · Motion Canvas' },
    { id: 'scene-2', start: 5.5, end: 12.0, engine: 'Remotion · Paper Cutout' },
    { id: 'scene-3', start: 12.0, end: 18.0, engine: 'Manim · Cable Cross-Section' },
    { id: 'scene-4', start: 18.0, end: 26.5, engine: 'Motion Canvas · Packet Routing' },
    { id: 'scene-5', start: 26.5, end: 33.5, engine: 'Paper Cutout · Narrative' },
    { id: 'scene-6', start: 33.5, end: 39.36, engine: 'Remotion · Master Outro' },
  ];

  // Responsive Stage Scaling (Auto-fit into any window)
  function fitStageToScreen() {
    const margin = 80;
    const availableW = window.innerWidth - margin;
    const availableH = window.innerHeight - margin;
    const scale = Math.min(availableW / 1080, availableH / 1920);
    stage.style.transform = `scale(${scale})`;
  }
  window.addEventListener('resize', fitStageToScreen);
  fitStageToScreen();

  // Procedural Paper Texture Canvas
  function renderPaperTexture() {
    const canvas = document.getElementById('paper-bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Base warm paper gradient
    const grad = ctx.createRadialGradient(540, 960, 200, 540, 960, 1100);
    grad.addColorStop(0, '#F5EFE0');
    grad.addColorStop(0.7, '#EFE8D6');
    grad.addColorStop(1, '#E2D8C0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle paper fibers & noise
    const imgData = ctx.getImageData(0, 0, 1080, 1920);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 14;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);
  }
  renderPaperTexture();

  // Update Frame Elements based on currentTime
  function updateFrame(t) {
    currentTime = Math.max(0, Math.min(TOTAL_DURATION, t));

    // Update timecode display
    const mins = Math.floor(currentTime / 60);
    const secs = Math.floor(currentTime % 60);
    const millis = Math.floor((currentTime % 1) * 100);
    timecode.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
    scrubber.value = currentTime;

    // Determine current active scene
    let currentSceneObj = scenes[0];
    scenes.forEach(sc => {
      const el = document.getElementById(sc.id);
      if (currentTime >= sc.start && currentTime < sc.end) {
        el.classList.add('active');
        currentSceneObj = sc;
      } else {
        el.classList.remove('active');
      }
    });

    if (engineBadge) {
      engineBadge.textContent = currentSceneObj.engine;
    }

    // --- ANIMATIONS PER SCENE (Synced with Voiceover Cues) ---

    // Scene 1: Cloud & Signal (0 - 5.5s)
    if (currentTime < 5.5) {
      const relT = currentTime;
      const cloud = document.getElementById('s1-cloud');
      const signals = document.getElementById('s1-signals');
      if (cloud) {
        const floatY = Math.sin(relT * 3.5) * 16;
        cloud.style.transform = `translateY(${floatY}px)`;
      }
      if (signals) {
        const pulse = (Math.sin(relT * 8) + 1) / 2;
        signals.style.opacity = 0.3 + pulse * 0.7;
      }
    }

    // Scene 2: Ocean & Flip Clock (5.5s - 12.0s)
    if (currentTime >= 5.5 && currentTime < 12.0) {
      const relT = currentTime - 5.5;
      const cable = document.getElementById('s2-cable-path');
      const p1 = document.getElementById('s2-pulse-1');
      const p2 = document.getElementById('s2-pulse-2');

      if (cable && p1 && p2) {
        const totalLen = cable.getTotalLength();
        const progress1 = (relT * 0.45) % 1;
        const progress2 = ((relT * 0.45) + 0.5) % 1;
        const pt1 = cable.getPointAtLength(progress1 * totalLen);
        const pt2 = cable.getPointAtLength(progress2 * totalLen);
        p1.setAttribute('cx', pt1.x);
        p1.setAttribute('cy', pt1.y);
        p2.setAttribute('cx', pt2.x);
        p2.setAttribute('cy', pt2.y);
      }

      // Flip counter animation (ticks up smoothly to 99%)
      const flipD1 = document.getElementById('flip-d1');
      const flipD2 = document.getElementById('flip-d2');
      if (flipD1 && flipD2) {
        const targetNum = Math.min(99, Math.floor((relT / 3.0) * 99));
        flipD1.textContent = Math.floor(targetNum / 10);
        flipD2.textContent = targetNum % 10;
      }
    }

    // Scene 3: Manim Cable Anatomy Labels (12.0s - 18.0s)
    if (currentTime >= 12.0 && currentTime < 18.0) {
      const relT = currentTime - 12.0;
      const labels = document.getElementById('s3-labels');
      if (labels) {
        const enterOpacity = Math.min(1, relT * 2.0);
        labels.style.opacity = enterOpacity;
      }
    }

    // Scene 4: 10,000 km Latency ping (18.0s - 26.5s)
    if (currentTime >= 18.0 && currentTime < 26.5) {
      const relT = currentTime - 18.0;
      const route = document.getElementById('s4-active-route');
      if (route) {
        const dashOffset = 600 - (relT * 280) % 600;
        route.style.strokeDasharray = '90 300';
        route.style.strokeDashoffset = dashOffset;
      }

      // Latency counter (counts to 0:13 S)
      const latD2 = document.getElementById('lat-d2');
      const latD3 = document.getElementById('lat-d3');
      if (latD2 && latD3) {
        if (relT < 1.0) {
          latD2.textContent = Math.floor(Math.random() * 9);
          latD3.textContent = Math.floor(Math.random() * 9);
        } else {
          latD2.textContent = '1';
          latD3.textContent = '3';
        }
      }
    }

    // Scene 5: Anchor hazard (26.5s - 33.5s)
    if (currentTime >= 26.5 && currentTime < 33.5) {
      const relT = currentTime - 26.5;
      const anchor = document.getElementById('s5-anchor');
      if (anchor) {
        const swing = Math.sin(relT * 4.5) * 8;
        anchor.style.transform = `translate(370px, 180px) rotate(${swing}deg)`;
      }
    }
  }

  // Animation Loop (60 FPS)
  function loop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying) {
      currentTime += delta;
      if (currentTime >= TOTAL_DURATION) {
        currentTime = 0;
      }
      updateFrame(currentTime);
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Play / Pause Handlers with Synchronized Master Audio
  function togglePlay() {
    isPlaying = !isPlaying;
    btnPlay.textContent = isPlaying ? '⏸' : '▶';
    if (masterAudio) {
      if (isPlaying) {
        masterAudio.currentTime = currentTime;
        masterAudio.play().catch(() => {});
      } else {
        masterAudio.pause();
      }
    }
  }

  btnPlay.addEventListener('click', togglePlay);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    }
  });

  // Scrubber Handler
  scrubber.addEventListener('input', (e) => {
    isPlaying = false;
    btnPlay.textContent = '▶';
    updateFrame(parseFloat(e.target.value));
  });

  // Next / Prev Scene Jump
  btnPrev.addEventListener('click', () => {
    const curIdx = scenes.findIndex(s => currentTime >= s.start && currentTime < s.end);
    if (curIdx > 0) updateFrame(scenes[curIdx - 1].start);
    else updateFrame(0);
  });

  btnNext.addEventListener('click', () => {
    const curIdx = scenes.findIndex(s => currentTime >= s.start && currentTime < s.end);
    if (curIdx < scenes.length - 1) updateFrame(scenes[curIdx + 1].start);
  });

  // Deterministic Headless Render APIs (Exposed for Puppeteer / Chrome)
  window.setSeekTime = function(sec) {
    isPlaying = false;
    updateFrame(sec);
  };

  window.getTotalDuration = function() {
    return TOTAL_DURATION;
  };

  window.hideStudioControls = function() {
    const ctrl = document.getElementById('studio-controls');
    if (ctrl) ctrl.style.display = 'none';
    stage.style.transform = 'scale(1)';
  };

  // Initial draw & URL parameter support for headless rendering
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('render') === '1') {
    const ctrl = document.getElementById('studio-controls');
    if (ctrl) ctrl.style.display = 'none';
    stage.style.transform = 'none';
    stage.style.position = 'fixed';
    stage.style.top = '0';
    stage.style.left = '0';
    document.body.style.background = '#000';
  }

  const initialT = urlParams.has('t') ? parseFloat(urlParams.get('t')) : 0;
  updateFrame(initialT);
})();
