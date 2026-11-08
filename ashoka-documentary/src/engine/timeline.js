// Ashoka Samrat Documentary - Timeline & Animation Engine
(function() {
  const TOTAL_DURATION = 22.31; // Exact duration of IndicF5 master soundtrack
  let currentTime = 0.0;
  let isPlaying = false;
  let lastTimestamp = null;

  const stage = document.getElementById('stage-container');
  const scrubber = document.getElementById('timeline-scrubber');
  const timecode = document.getElementById('timecode');
  const btnPlay = document.getElementById('btn-play');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const voiceBadge = document.getElementById('voice-badge');
  const masterAudio = document.getElementById('master-audio');

  const scenes = [
    { id: 'scene-1', start: 0, end: 3.8, title: 'Chapter 1: The Mauryan Conqueror' },
    { id: 'scene-2', start: 3.8, end: 8.0, title: 'Chapter 2: The Battle of Kalinga' },
    { id: 'scene-3', start: 8.0, end: 11.8, title: 'Chapter 3: The Breaking Point' },
    { id: 'scene-4', start: 11.8, end: 15.6, title: 'Chapter 4: The Dhamma Revolution' },
    { id: 'scene-5', start: 15.6, end: 19.2, title: 'Chapter 5: Ashoka Chakra & Pillars' },
    { id: 'scene-6', start: 19.2, end: 23.0, title: 'Chapter 6: The Eternal Legacy' },
  ];

  // Responsive Scaling
  function fitStageToScreen() {
    const margin = 80;
    const availableW = window.innerWidth - margin;
    const availableH = window.innerHeight - margin;
    const scale = Math.min(availableW / 1080, availableH / 1920);
    stage.style.transform = `scale(${scale})`;
  }
  window.addEventListener('resize', fitStageToScreen);
  fitStageToScreen();

  // Procedural Aged Parchment Canvas with Gold Flecks
  function renderParchmentTexture() {
    const canvas = document.getElementById('parchment-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Warm ochre & parchment gradient
    const grad = ctx.createRadialGradient(540, 960, 200, 540, 960, 1100);
    grad.addColorStop(0, '#FAF2E4');
    grad.addColorStop(0.65, '#EFE2CB');
    grad.addColorStop(1, '#D8C3A4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle paper fibers & gold flakes
    const imgData = ctx.getImageData(0, 0, 1080, 1920);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 16;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise - 2));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise - 6));
    }
    ctx.putImageData(imgData, 0, 0);
  }
  renderParchmentTexture();

  // Frame Update Logic
  function updateFrame(t) {
    currentTime = Math.max(0, Math.min(TOTAL_DURATION, t));

    const mins = Math.floor(currentTime / 60);
    const secs = Math.floor(currentTime % 60);
    const millis = Math.floor((currentTime % 1) * 100);
    timecode.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
    scrubber.value = currentTime;

    // Active Scene Switching
    let curScene = scenes[0];
    scenes.forEach(sc => {
      const el = document.getElementById(sc.id);
      if (currentTime >= sc.start && currentTime < sc.end) {
        el.classList.add('active');
        curScene = sc;
      } else {
        el.classList.remove('active');
      }
    });

    if (voiceBadge) {
      voiceBadge.textContent = curScene.title;
    }

    // --- ANIMATIONS PER CHAPTER (Synced to IndicF5 Narration) ---

    // Chapter 1: War Elephant Gentle Sway (0s - 3.8s)
    if (currentTime < 3.8) {
      const elephant = document.getElementById('s1-elephant');
      if (elephant) {
        const floatY = Math.sin(currentTime * 4) * 14;
        const rotate = Math.sin(currentTime * 2) * 1.8;
        elephant.style.transform = `translateY(${floatY}px) rotate(${rotate}deg)`;
      }
    }

    // Chapter 2: Swords Clashing & Sparks & Flip Counter (3.8s - 8.0s)
    if (currentTime >= 3.8 && currentTime < 8.0) {
      const relT = currentTime - 3.8;
      const swordL = document.getElementById('s2-sword-l');
      const swordR = document.getElementById('s2-sword-r');
      const sparks = document.getElementById('s2-sparks');

      if (swordL && swordR) {
        const clash = Math.sin(relT * 12) * 10;
        swordL.style.transform = `translate(400px, 230px) rotate(${-45 + clash}deg)`;
        swordR.style.transform = `translate(400px, 230px) rotate(${45 - clash}deg)`;
      }

      if (sparks) {
        const sparkScale = 0.8 + Math.abs(Math.sin(relT * 16)) * 0.9;
        sparks.style.transform = `scale(${sparkScale})`;
        sparks.style.transformOrigin = '400px 230px';
      }

      // Flip counter animation (ticks to 100K+)
      const k1 = document.getElementById('ash-k1');
      const k2 = document.getElementById('ash-k2');
      const k3 = document.getElementById('ash-k3');
      if (k1 && k2 && k3) {
        const num = Math.min(100, Math.floor((relT / 2.5) * 100));
        k1.textContent = Math.floor(num / 100);
        k2.textContent = Math.floor((num % 100) / 10);
        k3.textContent = num % 10;
      }
    }

    // Chapter 3: Golden Lotus Blooming (8.0s - 11.8s)
    if (currentTime >= 8.0 && currentTime < 11.8) {
      const relT = currentTime - 8.0;
      const lotus = document.getElementById('s3-lotus');
      if (lotus) {
        const bloomScale = Math.min(1.2, 0.4 + (relT / 2.5) * 0.8);
        lotus.style.transform = `translate(390px, 430px) scale(${bloomScale})`;
      }
    }

    // Chapter 4: Dhamma Light Pulse (11.8s - 15.6s)
    if (currentTime >= 11.8 && currentTime < 15.6) {
      // Gentle aura
    }

    // Chapter 5: 24-Spoke Ashoka Chakra Rotation (15.6s - 19.2s)
    if (currentTime >= 15.6 && currentTime < 19.2) {
      const relT = currentTime - 15.6;
      const chakra = document.getElementById('s5-chakra');
      if (chakra) {
        const rotationDeg = (relT * 60) % 360;
        chakra.style.transform = `rotate(${rotationDeg}deg)`;
      }
    }
  }

  // 60 FPS Loop
  function loop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying) {
      currentTime += delta;
      if (currentTime >= TOTAL_DURATION) currentTime = 0;
      updateFrame(currentTime);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function togglePlay() {
    isPlaying = !isPlaying;
    btnPlay.textContent = isPlaying ? '⏸' : '▶';
    if (masterAudio && masterAudio.src) {
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

  scrubber.addEventListener('input', (e) => {
    isPlaying = false;
    btnPlay.textContent = '▶';
    updateFrame(parseFloat(e.target.value));
  });

  btnPrev.addEventListener('click', () => {
    const curIdx = scenes.findIndex(s => currentTime >= s.start && currentTime < s.end);
    if (curIdx > 0) updateFrame(scenes[curIdx - 1].start);
    else updateFrame(0);
  });

  btnNext.addEventListener('click', () => {
    const curIdx = scenes.findIndex(s => currentTime >= s.start && currentTime < s.end);
    if (curIdx < scenes.length - 1) updateFrame(scenes[curIdx + 1].start);
  });

  // Headless Render APIs
  window.setSeekTime = function(sec) {
    isPlaying = false;
    updateFrame(sec);
  };

  window.getTotalDuration = function() {
    return TOTAL_DURATION;
  };

  // URL parameters for headless render
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('render') === '1') {
    const ctrl = document.getElementById('studio-controls');
    if (ctrl) ctrl.style.display = 'none';
    stage.style.transform = 'none';
    stage.style.position = 'fixed';
    stage.style.top = '0';
    stage.style.left = '0';
    document.body.style.background = '#000';
    document.body.classList.add('render-mode');
  }

  const initialT = urlParams.has('t') ? parseFloat(urlParams.get('t')) : 0;
  updateFrame(initialT);
})();
