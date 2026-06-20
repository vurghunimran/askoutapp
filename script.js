/* =============================================
   AskOut — Interactive Date Invitation
   Vanilla JS · No dependencies
   ============================================= */

'use strict';

// ---- State ----
const state = {
  activities: [],
  foods: [],
  date: '',
  time: '',
};

// ---- DOM helpers ----
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---- Step navigation ----
let currentStep = 1;
const TOTAL_STEPS = 6;

function goToStep(n) {
  $$(`.step`).forEach(el => el.classList.remove('active'));
  const target = $(`#step-${stepId(n)}`);
  if (target) {
    target.classList.add('active');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  currentStep = n;
  updateDots(n);
  // Show No button only on step 2
  const noBtn = $('#btn-no');
  if (noBtn) noBtn.style.display = (n === 2) ? 'inline-flex' : 'none';
  const hint = $('#no-hint');
  if (hint && n !== 2) { hint.textContent = ''; hint.style.opacity = '0'; }
}

function stepId(n) {
  const ids = ['welcome','question','activity','food','datetime','final'];
  return ids[n - 1];
}

function updateDots(n) {
  $$('.dot').forEach((dot, i) => {
    dot.classList.remove('active','done');
    if (i + 1 === n) dot.classList.add('active');
    else if (i + 1 < n) dot.classList.add('done');
  });
}

// ---- Floating hearts background ----
function spawnFloatingHearts() {
  const container = $('#hearts-bg');
  const hearts = ['❤️','💕','💖','💗','💓','🌸','💞'];
  let i = 0;

  setInterval(() => {
    const el = document.createElement('span');
    el.className = 'heart-float';
    el.textContent = hearts[i % hearts.length];
    el.style.left = Math.random() * 100 + 'vw';
    const dur = 7 + Math.random() * 8;
    el.style.animationDuration = dur + 's';
    el.style.animationDelay    = '0s';
    el.style.fontSize = (0.9 + Math.random() * 1.1) + 'rem';
    container.appendChild(el);
    i++;
    // Remove after animation ends
    setTimeout(() => el.remove(), (dur + 1) * 1000);
  }, 900);
}

// ---- No button logic ----
const noHints = [
  'No is not available today 😌',
  'Wrong button, try again 😇',
  'Nice try! 😭',
  'That button is broken 🙈',
  'Nope, keep looking 😜',
  'Error 404: No not found 💅',
  'This button doesn\'t exist 🫣',
  'Impossible! 🚫',
];
let hintIndex = 0;

function moveNoButton() {
  const btn = $('#btn-no');
  const hint = $('#no-hint');

  // Show a cycling hint
  hint.textContent = noHints[hintIndex % noHints.length];
  hintIndex++;

  // Bounce animation reset
  btn.classList.remove('bounce');
  void btn.offsetWidth; // force reflow
  btn.classList.add('bounce');

  // Pick a random spot within viewport, avoiding the Yes button zone
  const margin = 80;
  const bw = btn.offsetWidth  || 140;
  const bh = btn.offsetHeight || 48;

  const maxX = window.innerWidth  - bw - margin;
  const maxY = window.innerHeight - bh - margin;

  const newX = margin + Math.random() * maxX;
  const newY = margin + Math.random() * maxY;

  btn.style.left = newX + 'px';
  btn.style.top  = newY + 'px';
}

function initNoButton() {
  const btn = $('#btn-no');
  if (!btn) return;

  // Hidden until step 2
  btn.style.display = 'none';

  // Initial position: bottom-center of viewport
  const centerX = (window.innerWidth  / 2) + 100;
  const centerY = (window.innerHeight / 2) + 20;
  btn.style.left = centerX + 'px';
  btn.style.top  = centerY + 'px';

  // Desktop: flee on mouseenter proximity
  document.addEventListener('mousemove', (e) => {
    if (currentStep !== 2) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) moveNoButton();
  });

  // Mobile: move on touchstart
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNoButton();
  }, { passive: false });

  // Failsafe click — still move
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButton();
  });
}

// ---- Celebration ----
function celebrate() {
  const overlay = $('#celebration');
  overlay.style.display = 'block';
  const emojis = ['❤️','💖','💕','💗','🌸','✨','💞','🎉','💝'];

  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.className = 'confetti-heart';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top  = '-30px';
      el.style.animationDelay = Math.random() * 0.6 + 's';
      overlay.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }, i * 30);
  }

  setTimeout(() => { overlay.style.display = 'none'; }, 2500);
}

// ---- Option card toggle ----
function setupOptionCards(gridSel, stateKey, nextBtnId) {
  const cards = $$(gridSel + ' .option-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const val = card.dataset.value;
      card.classList.toggle('selected');
      card.setAttribute('aria-pressed', card.classList.contains('selected'));
      if (card.classList.contains('selected')) {
        if (!state[stateKey].includes(val)) state[stateKey].push(val);
      } else {
        state[stateKey] = state[stateKey].filter(v => v !== val);
      }
      const nextBtn = $(nextBtnId);
      if (nextBtn) nextBtn.disabled = state[stateKey].length === 0;
    });
  });
}

// ---- Date & Time ----
function setupDateTime() {
  const dateInput = $('#date-input');
  const nextBtn   = $('#btn-confirm-date');

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;

  function checkDateTimeValid() {
    nextBtn.disabled = !(state.date && state.time);
  }

  dateInput.addEventListener('change', () => {
    state.date = dateInput.value;
    checkDateTimeValid();
  });

  $$('.time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.time-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.time = btn.dataset.time;
      checkDateTimeValid();
    });
  });
}

// ---- Build final summary ----
function buildSummary() {
  const join = (arr) => arr.join(', ') || '—';

  // Format date nicely
  let displayDate = '—';
  if (state.date) {
    const d = new Date(state.date + 'T12:00:00');
    displayDate = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  $('#summary-activities').textContent = join(state.activities);
  $('#summary-foods').textContent       = join(state.foods);
  $('#summary-date').textContent        = displayDate;
  $('#summary-time').textContent        = state.time || '—';

  // Downloadable card
  $('#dc-activities').innerHTML = `<span>${join(state.activities)}</span>`;
  $('#dc-foods').innerHTML      = `<span>${join(state.foods)}</span>`;
  $('#dc-date').innerHTML       = `<span>${displayDate}</span>`;
  $('#dc-time').innerHTML       = `<span>${state.time || '—'}</span>`;
}

// ---- Download card as PNG ----
async function downloadCard() {
  const card = $('#downloadable-card');

  // Use html2canvas-like approach via canvas — but since we can't use external libs,
  // we'll use a DOM-to-SVG-to-canvas technique or fallback to a styled canvas.
  // Since we promised no external libs, we'll draw it manually on a canvas.
  const canvas  = document.createElement('canvas');
  const scale   = 3; // high quality
  const w = 480;
  const h = 560;
  canvas.width  = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0,   '#fff0f8');
  bg.addColorStop(0.5, '#fde8f2');
  bg.addColorStop(1,   '#f0e6f7');
  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, w, h, 20);
  ctx.fill();

  // Border
  ctx.strokeStyle = '#f8a4c8';
  ctx.lineWidth = 4;
  roundRect(ctx, 2, 2, w - 4, h - 4, 18);
  ctx.stroke();

  // Big faded heart watermark
  ctx.font = '160px serif';
  ctx.fillStyle = 'rgba(248,164,200,0.08)';
  ctx.fillText('💖', w - 120, 120);

  // Our picture
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = './assets/our-picture.jpg';

  const drawContent = () => {
    // Circular photo
    const cx = w / 2, cy = 110, r = 80;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    try { ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2); } catch(e) {}
    ctx.restore();

    // Photo border
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.strokeStyle = '#e87db0';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Title
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillStyle = '#e87db0';
    ctx.textAlign = 'center';
    ctx.fillText('Our Date Plan 💖', w / 2, 220);

    // Divider
    ctx.fillStyle = '#f8a4c8';
    roundRect(ctx, w/2 - 30, 232, 60, 3, 2);
    ctx.fill();

    // Summary rows
    const rows = [
      ['✨ Activities:', $('#summary-activities')?.textContent || ''],
      ['🍽️ Food:',      $('#summary-foods')?.textContent      || ''],
      ['📅 Date:',      $('#summary-date')?.textContent       || ''],
      ['🕐 Time:',      $('#summary-time')?.textContent       || ''],
    ];

    let y = 265;
    rows.forEach(([label, val]) => {
      ctx.textAlign = 'left';
      ctx.font = 'bold 13px Georgia, serif';
      ctx.fillStyle = '#e87db0';
      ctx.fillText(label, 50, y);
      ctx.font = '13px Georgia, serif';
      ctx.fillStyle = '#4a3040';
      // Wrap long text
      wrapText(ctx, val, 50, y + 18, w - 100, 18);
      y += 52;
    });

    // Final message
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillStyle = '#e87db0';
    ctx.fillText('Be ready baby doll, I will pick you up 🚗💖', w / 2, h - 50);

    ctx.font = '13px Georgia, serif';
    ctx.fillStyle = '#b08090';
    ctx.fillText('I can\'t wait to see you ❤️', w / 2, h - 28);

    // Download
    const link = document.createElement('a');
    link.download = 'our-date-plan.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  img.onload  = drawContent;
  img.onerror = drawContent; // draw without photo if missing
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(', ');
  let line = '';
  let lineY = y;
  words.forEach((word, i) => {
    const test = line + (line ? ', ' : '') + word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line  = word;
      lineY += lineHeight;
    } else {
      line = test;
    }
  });
  if (line) ctx.fillText(line, x, lineY);
}

// ---- Build road scene hearts ----
function buildRoadHearts() {
  const container = $('.road-hearts');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const span = document.createElement('span');
    span.textContent = i % 3 === 0 ? '🌸' : '💖';
    container.appendChild(span);
  }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  spawnFloatingHearts();
  initNoButton();
  buildRoadHearts();

  // Step 1 → 2
  $('#btn-start').addEventListener('click', () => goToStep(2));

  // Step 2 Yes
  $('#btn-yes').addEventListener('click', () => {
    celebrate();
    setTimeout(() => goToStep(3), 600);
  });

  // Step 3 — Activities
  setupOptionCards('#activity-grid', 'activities', '#btn-activity-next');
  $('#btn-activity-next').addEventListener('click', () => goToStep(4));

  // Step 4 — Food
  setupOptionCards('#food-grid', 'foods', '#btn-food-next');
  $('#btn-food-next').addEventListener('click', () => goToStep(5));

  // Step 5 — Date & Time
  setupDateTime();
  $('#btn-confirm-date').addEventListener('click', () => {
    buildSummary();
    goToStep(6);
  });

  // Download
  $('#btn-download').addEventListener('click', downloadCard);
});
