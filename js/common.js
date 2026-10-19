let Muted = localStorage.getItem('kid_mute') === '1';
let starN = 0;
let actx = null;

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function wrongNums(n, min, max, k) {
  const s = new Set([n]);
  while (s.size < k + 1) { s.add(randInt(min, max)); }
  return shuffle([...s].filter(v => v !== n));
}

function actxEnsure() {
  if (!actx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    actx = new AC();
  }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function beep(freq, dur, type, vol, delay) {
  const ac = actxEnsure();
  if (!ac || Muted) return;
  delay = delay || 0;
  const t = ac.currentTime + delay;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol || 0.25, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(ac.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}
const Sfx = {
  click() { beep(600, 0.08, 'triangle', 0.25); },
  pop() { beep(700, 0.06, 'square', 0.3); beep(320, 0.14, 'sine', 0.25, 0.04); },
  good() { beep(523, 0.12, 'triangle', 0.3); beep(659, 0.12, 'triangle', 0.3, 0.1); beep(784, 0.2, 'triangle', 0.3, 0.2); },
  bad() { beep(200, 0.28, 'sawtooth', 0.18); },
  win() { [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.18, 'triangle', 0.3, i * 0.12)); beep(1319, 0.4, 'triangle', 0.3, 0.55); }
};

const Voice = {
  speak(text) {
    if (Muted) return;
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW';
    u.rate = 0.85;
    u.pitch = 1.15;
    const vs = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().indexOf('zh') === 0);
    if (vs.length) {
      let tw = vs.find(v => /tw|taiwan|hant|hong|yue/i.test(v.lang + v.name));
      u.voice = tw || vs[0];
    }
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
};
document.addEventListener('click', function unlock() { actxEnsure(); }, { once: true });

function addTotalStars(n) {
  const t = parseInt(localStorage.getItem('kid_stars') || '0', 10) + n;
  localStorage.setItem('kid_stars', String(t));
}
function addStar(n) {
  starN += (n || 1);
  const e = document.getElementById('starN');
  if (e) e.textContent = starN;
  addTotalStars(n || 1);
}

function toggleMute() {
  Muted = !Muted;
  localStorage.setItem('kid_mute', Muted ? '1' : '0');
  if (Muted && window.speechSynthesis) speechSynthesis.cancel();
}

function buildHeader(title, instructions) {
  const h = document.createElement('div');
  h.className = 'top';
  h.innerHTML = '<a class="btn home" href="../index.html">🏠 大廳</a>' +
    '<div class="ttl">' + title + '</div>' +
    '<div class="tools">' +
    '<button class="btn blue icon" id="sayBtn">🔊 聽說明</button>' +
    '<button class="btn icon" id="muteBtn"></button>' +
    '<div class="stars">⭐ <b id="starN">0</b></div>' +
    '</div>';
  const page = document.querySelector('.page');
  page.insertBefore(h, page.firstChild);
  document.getElementById('sayBtn').addEventListener('click', () => { Sfx.click(); Voice.speak(instructions); });
  const mb = document.getElementById('muteBtn');
  const upd = () => { mb.textContent = Muted ? '🔇' : '📢'; mb.classList.toggle('orange', true); };
  upd();
  mb.addEventListener('click', () => { toggleMute(); upd(); });
  if (instructions) {
    if (window.speechSynthesis) speechSynthesis.getVoices();
    setTimeout(() => { try { Voice.speak(instructions); } catch (e) {} }, 500);
  }
}

const PALETTE = ['#ff5f6f', '#ffc63c', '#43d19e', '#54a7ff', '#b06ef7', '#ff9d54'];
function confetti(n) {
  for (let i = 0; i < (n || 40); i++) {
    const s = document.createElement('span');
    s.className = 'cf';
    s.style.left = (Math.random() * 100) + 'vw';
    s.style.background = PALETTE[i % PALETTE.length];
    s.style.animationDelay = (Math.random() * 0.5) + 's';
    s.style.animationDuration = (1.2 + Math.random() * 1.3) + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 3000);
  }
}
function burst(x, y) {
  for (let i = 0; i < 10; i++) {
    const m = document.createElement('span');
    m.className = 'mini';
    m.style.left = x + 'px';
    m.style.top = y + 'px';
    m.style.background = PALETTE[randInt(0, PALETTE.length - 1)];
    const ang = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    m.style.setProperty('--mx', (Math.cos(ang) * dist) + 'px');
    m.style.setProperty('--my', (Math.sin(ang) * dist) + 'px');
    document.body.appendChild(m);
    setTimeout(() => m.remove(), 600);
  }
}

function showWin(msg, onReplay) {
  const mask = document.createElement('div');
  mask.className = 'win-mask';
  mask.innerHTML = '<div class="win-card"><div class="big">🎉</div><div>' + msg + '</div>' +
    '<div class="row"><button class="btn green" id="reBtn">🔄 再玩一次</button>' +
    '<a class="btn pink" href="../index.html">🏠 回大廳</a></div></div>';
  document.body.appendChild(mask);
  requestAnimationFrame(() => mask.classList.add('show'));
  Sfx.win();
  confetti(80);
  Voice.speak('太棒了！你最厲害！');
  mask.querySelector('#reBtn').addEventListener('click', () => {
    Sfx.click();
    mask.remove();
    onReplay();
  });
}

function shake(el) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

const CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
