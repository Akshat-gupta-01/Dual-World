/* ─── WORLD TOGGLE ──────────────────────────────────────────────── */
let isUpsideDown = false;
const btn = document.getElementById('world-toggle');
const heroBtn = document.getElementById('hero-toggle');
const ctaBtn = document.getElementById('cta-toggle');

function toggleWorld() {
  // Initialize audio on first active gesture
  if (typeof initAudio === 'function') {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  isUpsideDown = !isUpsideDown;
  const html = document.documentElement;

  // Flip animation
  document.body.classList.add('flipping');
  setTimeout(() => document.body.classList.remove('flipping'), 900);

  if (isUpsideDown) {
    html.setAttribute('data-mode', 'upside-down');
    btn.textContent = '◎ Go to Real World';
    if (heroBtn) heroBtn.textContent = 'GO TO REAL WORLD';
    if (ctaBtn) ctaBtn.textContent = 'GO TO REAL WORLD';
    document.title = '̴D̵U̷A̸L̴ ̷W̸O̸R̸L̷D̵ — ̸T̶h̶e̵ ̴U̵p̷s̶i̵d̸e̷ ̴D̸o̶w̴n̷';
    triggerGlitchFlash();
  } else {
    html.setAttribute('data-mode', 'normal');
    btn.textContent = '⬡ Enter Upside Down';
    if (heroBtn) heroBtn.textContent = 'ENTER THE UPSIDE DOWN';
    if (ctaBtn) ctaBtn.textContent = 'ENTER THE UPSIDE DOWN';
    document.title = 'DUAL WORLD — Two Worlds. One Click.';
  }

  // Update particle colors
  setTimeout(initParticles, 100);

  // Update soundscape
  if (typeof updateAudio === 'function') updateAudio();
}

/* ─── GLITCH FLASH ──────────────────────────────────────────────── */
function triggerGlitchFlash() {
  const overlay = document.getElementById('glitch-overlay');
  let flashes = 0;
  const interval = setInterval(() => {
    overlay.style.background = flashes % 2 === 0
      ? 'rgba(255,0,50,0.15)'
      : 'rgba(0,255,200,0.08)';
    if (++flashes > 8) {
      clearInterval(interval);
      overlay.style.background = '';
    }
  }, 60);
}

/* ─── PARTICLE SYSTEM ───────────────────────────────────────────── */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animId;

function getMode() { return document.documentElement.getAttribute('data-mode'); }

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.r = Math.random() * 2.5 + 0.5;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.alpha = Math.random() * 0.6 + 0.1;
    this.life = Math.random() * 300 + 100;
    this.age = 0;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    if (this.age > this.life || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
    // Upside down: drift upward
    if (getMode() === 'upside-down') this.y -= 0.3;
  }
  draw() {
    const mode = getMode();
    const color = mode === 'upside-down' ? `rgba(255,30,30,${this.alpha})` : `rgba(26,107,255,${this.alpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function initParticles() {
  cancelAnimationFrame(animId);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles = Array.from({ length: 80 }, () => new Particle());
  loop();
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Connect nearby particles
  const mode = getMode();
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const alpha = (1 - dist / 120) * 0.15;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = mode === 'upside-down'
          ? `rgba(255,30,30,${alpha})`
          : `rgba(26,107,255,${alpha * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  particles.forEach(p => { p.update(); p.draw(); });
  animId = requestAnimationFrame(loop);
}

window.addEventListener('resize', initParticles);
initParticles();

/* ─── SCROLL REVEAL ─────────────────────────────────────────────── */
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

/* ─── RANDOM GLITCH IN UPSIDE DOWN ─────────────────────────────── */
setInterval(() => {
  if (getMode() !== 'upside-down') return;
  const glitch = document.getElementById('glitch-overlay');
  glitch.style.transform = `translateX(${(Math.random()-0.5)*6}px)`;
  setTimeout(() => glitch.style.transform = '', 80);
}, 2500);

/* ─── SCROLL TO TOP ─────────────────────────────────────────────── */
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

/* ─── AUDIO SYSTEM ──────────────────────────────────────────────── */
let audioCtx;
let normalOsc, darkOsc, darkOsc2;
let normalGain, darkGain;

function initAudio() {
  if (audioCtx) return;
  
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  // --- Normal World Sound (Soft, calm sine wave) ---
  normalOsc = audioCtx.createOscillator();
  normalOsc.type = 'sine';
  normalOsc.frequency.value = 432; // Calming frequency

  normalGain = audioCtx.createGain();
  normalGain.gain.value = 0; // Starts silent

  normalOsc.connect(normalGain);
  normalGain.connect(audioCtx.destination);
  normalOsc.start();

  // --- Dark World Sound (Low eerie drone) ---
  darkOsc = audioCtx.createOscillator();
  darkOsc.type = 'sawtooth';
  darkOsc.frequency.value = 65; // Low rumble

  darkOsc2 = audioCtx.createOscillator();
  darkOsc2.type = 'square';
  darkOsc2.frequency.value = 66; // Slight detune for phasing effect

  let darkFilter = audioCtx.createBiquadFilter();
  darkFilter.type = 'lowpass';
  darkFilter.frequency.value = 150; // Muffled, dark feel

  darkGain = audioCtx.createGain();
  darkGain.gain.value = 0;

  darkOsc.connect(darkFilter);
  darkOsc2.connect(darkFilter);
  darkFilter.connect(darkGain);
  darkGain.connect(audioCtx.destination);
  
  darkOsc.start();
  darkOsc2.start();

  // LFO for creepy wobble in dark mode
  let lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.5; // Wobbles every 2 seconds
  
  let lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 5; 
  lfo.connect(lfoGain);
  lfoGain.connect(darkOsc.frequency);
  lfo.start();
}

function updateAudio() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  
  const fadeTime = 1.0;

  if (isUpsideDown) {
    // Fade out normal, fade in dark
    normalGain.gain.setTargetAtTime(0, now, fadeTime / 3);
    darkGain.gain.setTargetAtTime(0.15, now, fadeTime / 3);
    
    // Play a glitch noise transition
    playGlitchSound();
  } else {
    // Fade out dark, fade in normal
    darkGain.gain.setTargetAtTime(0, now, fadeTime / 3);
    normalGain.gain.setTargetAtTime(0.04, now, fadeTime / 3); // Normal is very soft
  }
}

function playGlitchSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.3);
  
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}

/* ─── AMBIENT AUDIO AUTO-START ──────────────────────────────────── */
const startAmbientAudio = () => {
  if (!audioCtx) {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    // Only fade in normal sound if we are still in the normal world
    if (!isUpsideDown) {
      updateAudio();
    }
  }

  // Once initialized, we don't need these listeners anymore
  ['click', 'touchstart', 'keydown', 'scroll'].forEach(evt => {
    window.removeEventListener(evt, startAmbientAudio);
  });
};

// Add listeners to catch the first user interaction
['click', 'touchstart', 'keydown', 'scroll'].forEach(evt => {
  window.addEventListener(evt, startAmbientAudio, { once: true, passive: true });
});