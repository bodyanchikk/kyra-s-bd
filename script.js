// =============================================
//   script.js  —  Birthday Page Logic
// =============================================

/* ══════════════════════════════════════════
   УТИЛІТА: видалення чорного фону через Canvas
   (для котика, ключа та подарунка)
   ══════════════════════════════════════ */
function removeBlackBg(imgEl, threshold = 48, fade = 40) {
  return new Promise(resolve => {
    const src = imgEl.src;
    if (!src) return resolve();

    const tmp = new Image();
    tmp.onload = () => {
      const cvs = document.createElement('canvas');
      const ctx = cvs.getContext('2d');
      cvs.width  = tmp.naturalWidth;
      cvs.height = tmp.naturalHeight;
      ctx.drawImage(tmp, 0, 0);
      try {
        const id = ctx.getImageData(0, 0, cvs.width, cvs.height);
        const d  = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const mx = Math.max(d[i], d[i + 1], d[i + 2]);
          if (mx < threshold) {
            d[i + 3] = 0;
          } else if (mx < threshold + fade) {
            d[i + 3] = Math.round(((mx - threshold) / fade) * d[i + 3]);
          }
        }
        ctx.putImageData(id, 0, 0);
        imgEl.src = cvs.toDataURL('image/png');
      } catch (e) {
        console.warn('removeBlackBg:', e);
      }
      resolve();
    };
    tmp.onerror = () => resolve();
    tmp.src = src;
  });
}

/* ══════════════════════════════════════════
   ЕЛЕМЕНТИ
   ══════════════════════════════════════ */

// Screen one
const envelopeBtn   = document.getElementById('envelope-btn');
const letterOverlay = document.getElementById('letter-overlay');
const keywordInput  = document.getElementById('keyword-input');
const answerText    = document.getElementById('answer-text');
const nextBtn       = document.getElementById('next-btn');
const soundCorrect  = document.getElementById('sound-correct');
const screenTwo     = document.getElementById('screen-two');

// Screen two
const giftImg    = document.getElementById('gift-img');
const keyEl      = document.getElementById('key-el');
const catImg     = document.getElementById('cat-img');
const catCorner  = document.getElementById('cat-corner');
const pawZone    = document.getElementById('paw-zone');
const giftAudio  = document.getElementById('gift-audio');
const meowAudio  = document.getElementById('meow-audio');
const siteMusic  = document.getElementById('site-music');

// Collage overlay
const collageOverlay = document.getElementById('collage-overlay');

const WRONG_WORDS = ['Киця', 'киця'];
const RIGHT_WORDS = ['Кируня', 'кируня'];

/* ══════════════════════════════════════════
   ФОНОВА МУЗИКА ПРИ ВХОДІ (LOOP)
   ══════════════════════════════════════ */
function startSiteMusic() {
  siteMusic.volume = 0.65;
  siteMusic.play().catch(() => {
    // Якщо браузер заблокував автоплей без взаємодії, запускаємо при першому кліку
    const unlockAudio = () => {
      siteMusic.play().catch(() => {});
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
  });
}

window.addEventListener('DOMContentLoaded', startSiteMusic);
window.addEventListener('load', startSiteMusic);

/* ══════════════════════════════════════════
   SCREEN ONE
   ══════════════════════════════════════ */

/* ── Конверт → лист ── */
envelopeBtn.addEventListener('click', () => {
  letterOverlay.classList.add('open');
});

// Закрити при кліку поза обгорткою листа
letterOverlay.addEventListener('click', (e) => {
  if (!e.target.closest('.letter-wrapper')) {
    letterOverlay.classList.remove('open');
  }
});

/* ── Input: перевірка ключового слова ── */
keywordInput.addEventListener('input', () => {
  const val = keywordInput.value.trim();

  answerText.textContent = '';
  answerText.className   = 'answer-text';
  nextBtn.style.display  = 'none';

  if (WRONG_WORDS.includes(val)) {
    answerText.textContent = 'Not that one, baby)';

  } else if (RIGHT_WORDS.includes(val)) {
    answerText.textContent = "Yep, you're right!!!";
    answerText.classList.add('green');
    nextBtn.style.display = 'inline-block';
    soundCorrect.currentTime = 0;
    soundCorrect.play().catch(() => {});
  }
});

/* ── Кнопка Next → відкрити другий екран ── */
nextBtn.addEventListener('click', () => {
  screenTwo.style.display = 'flex';
  document.body.classList.add('unlocked');

  setTimeout(() => {
    screenTwo.scrollIntoView({ behavior: 'smooth' });
    setTimeout(initGiftPos, 520);
  }, 50);
});

/* ══════════════════════════════════════════
   ЗАВАНТАЖЕННЯ: видалення чорних фонів
   ══════════════════════════════════════ */
window.addEventListener('load', () => {
  removeBlackBg(catImg,  48, 40);
  removeBlackBg(keyEl,   48, 40);
  removeBlackBg(giftImg, 50, 45);
});

/* ══════════════════════════════════════════
   SCREEN TWO — ПОДАРУНОК
   ══════════════════════════════════════ */

let keyVisible   = false;
let keyDragging  = false;
let dragOX = 0, dragOY = 0;
let giftUnlocked = false;

/* ── Початкова позиція подарунка ── */
function initGiftPos() {
  const rect = screenTwo.getBoundingClientRect();
  const gw   = giftImg.offsetWidth  || 230;
  const gh   = giftImg.offsetHeight || 230;
  giftImg.style.left = (rect.width  / 2 - gw / 2) + 'px';
  giftImg.style.top  = (rect.height / 2 - gh / 2) + 'px';
}

/* ── Рандомне переміщення подарунка ── */
function moveGiftRandom() {
  const rect  = screenTwo.getBoundingClientRect();
  const gw    = giftImg.offsetWidth  || 230;
  const gh    = giftImg.offsetHeight || 230;
  const CAT_W = 180, CAT_H = 220, PAD = 20;

  let x, y, safe = false, tries = 0;
  while (!safe && tries < 50) {
    tries++;
    x = PAD + Math.random() * (rect.width  - gw - PAD * 2);
    y = 90  + Math.random() * (rect.height - gh - 110);
    if (!(x < CAT_W + PAD && y > rect.height - CAT_H - PAD)) safe = true;
  }

  giftImg.style.transition =
    'left 0.4s cubic-bezier(.34,1.56,.64,1), top 0.4s cubic-bezier(.34,1.56,.64,1)';
  giftImg.style.left = x + 'px';
  giftImg.style.top  = y + 'px';
  setTimeout(() => { giftImg.style.transition = ''; }, 450);
}

/* ── Клік на подарунок → рандомне місце ── */
giftImg.addEventListener('click', () => {
  if (giftUnlocked || keyDragging) return;
  moveGiftRandom();
});

/* ── Котик: підстрибування та нявкання ── */
let isBouncing = false;

catCorner.addEventListener('mouseenter', () => {
  if (isBouncing) return;
  isBouncing = true;
  catCorner.classList.add('cat-bouncing');
  meowAudio.currentTime = 0;
  meowAudio.play().catch(() => {});
  setTimeout(() => {
    catCorner.classList.remove('cat-bouncing');
    isBouncing = false;
  }, 520);
});

/* ── Клік на лапку → показати ключ ── */
pawZone.addEventListener('click', () => {
  if (keyVisible || giftUnlocked) return;
  keyVisible = true;

  const catRect = catImg.getBoundingClientRect();
  keyEl.style.left = (catRect.right - 55) + 'px';
  keyEl.style.top  = (catRect.top   +  5) + 'px';
  keyEl.classList.add('key-visible');
});

/* ── Перетягування ключа ── */
keyEl.addEventListener('mousedown', (e) => {
  if (!keyVisible || giftUnlocked) return;
  e.preventDefault();
  keyDragging = true;
  const r = keyEl.getBoundingClientRect();
  dragOX = e.clientX - r.left;
  dragOY = e.clientY - r.top;
  keyEl.classList.add('key-dragging');
});

document.addEventListener('mousemove', (e) => {
  if (!keyDragging || giftUnlocked) return;
  keyEl.style.left = (e.clientX - dragOX) + 'px';
  keyEl.style.top  = (e.clientY - dragOY) + 'px';
  checkKeyGiftOverlap();
});

document.addEventListener('mouseup', () => {
  if (!keyDragging) return;
  keyDragging = false;
  keyEl.classList.remove('key-dragging');
  if (!giftUnlocked) giftImg.classList.remove('gift-glow');
});

/* ── Перевірка: ключ над подарунком ── */
function checkKeyGiftOverlap() {
  if (giftUnlocked) return;
  const kr  = keyEl.getBoundingClientRect();
  const gr  = giftImg.getBoundingClientRect();
  const kcx = kr.left + kr.width  / 2;
  const kcy = kr.top  + kr.height / 2;

  if (kcx >= gr.left && kcx <= gr.right && kcy >= gr.top && kcy <= gr.bottom) {
    giftImg.classList.add('gift-glow');
    unlockGift();
  }
}

/* ── Розблокування подарунка ── */
function unlockGift() {
  if (giftUnlocked) return;
  giftUnlocked = true;
  keyDragging  = false;

  keyEl.classList.remove('key-dragging');
  keyEl.style.transition    = 'opacity 0.5s ease';
  keyEl.style.opacity       = '0';
  keyEl.style.pointerEvents = 'none';

  giftImg.style.cursor = 'default';

  setTimeout(() => {
    giftImg.classList.add('gift-shake');

    setTimeout(() => {
      giftImg.classList.remove('gift-shake', 'gift-glow');

      // Плавна заміна зображення відкритого подарунка
      giftImg.style.opacity = '0';
      setTimeout(() => {
        giftImg.src = 'gift_open.jpg';
        removeBlackBg(giftImg, 50, 45).then(() => {
          giftImg.style.opacity = '1';
          giftAudio.play().catch(() => {});
          // Через 1.5 с — плавно показати колаж (без сторонньої музики)
          setTimeout(openCollage, 1500);
        });
      }, 400);

    }, 1850);
  }, 250);
}

/* ══════════════════════════════════════
   ОВЕРЛЕЙ КОЛАЖУ
   ══════════════════════════════════════ */
function openCollage() {
  collageOverlay.classList.add('open');
}

// Закриття колажу при кліку
collageOverlay.addEventListener('click', () => {
  collageOverlay.classList.remove('open');
});
