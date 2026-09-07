/* ============================================================================
   THE SYNTHETIC GODS — GEOCITIES JAVASCRIPT
   Authentic 1996-1999 Web Interactivity Recreation
   No frameworks. No build steps. Pure vanilla JS like the Old Gods intended.
   ============================================================================ */

(function() {
  'use strict';

  // ==========================================================================
  // GLOBAL STATE (window.SYNTHETIC_GODS for debugging from console)
  // ==========================================================================
  window.SYNTHETIC_GODS = {
    version: '1.0.0',
    campaign: 'The Synthetic Gods',
    year: 1999,
    visitorCount: 0,
    sigilCharge: 0,
    egregorePower: 0,
    astrosomaThreshold: 10000
  };

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================
  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  function createEl(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (children) children.forEach(c => el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return el;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomChoice(arr) {
    return arr[randomInt(0, arr.length - 1)];
  }

  // ==========================================================================
  // VISITOR COUNTER (localStorage persistence, simulates server-side counter)
  // ==========================================================================
  function initVisitorCounter() {
    const counterEls = $$('.visitor-counter, .counter-display, [data-counter]');
    if (!counterEls.length) return;

    // Check if already counted this session
    const hasCounted = sessionStorage.getItem('sg_counted');
    let count = parseInt(localStorage.getItem('sg_visitor_count') || '0', 10);

    if (!hasCounted) {
      count += 1;
      localStorage.setItem('sg_visitor_count', count.toString());
      sessionStorage.setItem('sg_counted', 'true');
      window.SYNTHETIC_GODS.visitorCount = count;
    } else {
      window.SYNTHETIC_GODS.visitorCount = count;
    }

    // Format as 7-segment style: 0000000
    const formatted = count.toString().padStart(7, '0');

    counterEls.forEach(el => {
      if (el.tagName === 'INPUT') {
        el.value = formatted;
      } else {
        el.textContent = formatted;
        // Add animated digit flip effect
        animateCounterDigits(el, formatted);
      }
    });

    // Update global for other scripts
    document.dispatchEvent(new CustomEvent('sg:counterupdate', { detail: { count } }));
  }

  function animateCounterDigits(el, newValue) {
    const digits = el.querySelectorAll('.counter-digit');
    if (!digits.length) return;

    newValue.split('').forEach((digit, i) => {
      if (digits[i]) {
        digits[i].textContent = digit;
        digits[i].style.animation = 'none';
        digits[i].offsetHeight; // force reflow
        digits[i].style.animation = 'digitFlip 0.3s ease-out';
      }
    });
  }

  // ==========================================================================
  // SIGIL GENERATOR
  // ==========================================================================
  const SIGIL_CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ'.split('');
  const SIGIL_VOWELS = 'AEIOU'.split('');

  function generateSigil(intent) {
    if (!intent || !intent.trim()) return null;

    // Step 1: Reduce to consonants only
    let reduced = intent.toUpperCase()
      .replace(/[AEIOU\s]/g, '')
      .replace(/([A-Z])\1+/g, '$1'); // Remove duplicate consecutive

    // Step 2: Ensure minimum length, pad with mystical chars if needed
    const mysticalChars = ['@', '#', '$', '%', '&', '*', '+', '='];
    while (reduced.length < 8) {
      reduced += randomChoice(mysticalChars);
    }

    // Step 3: Create visual arrangements
    const arrangements = {
      linear: reduced,
      mirrored: reduced + reduced.split('').reverse().join(''),
      spiral: createSpiral(reduced),
      grid: createGrid(reduced),
      runic: convertToRunic(reduced)
    };

    return {
      intent: intent.trim(),
      reduced: reduced,
      arrangements: arrangements,
      timestamp: new Date().toISOString(),
      charge: 0
    };
  }

  function createSpiral(str) {
    const chars = str.split('');
    const size = Math.ceil(Math.sqrt(chars.length)) * 2 - 1;
    const grid = Array(size).fill(null).map(() => Array(size).fill(' '));
    let x = Math.floor(size / 2), y = Math.floor(size / 2);
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    let dir = 0, steps = 1, stepCount = 0, turnCount = 0;

    chars.forEach((char, i) => {
      if (x >= 0 && x < size && y >= 0 && y < size) grid[y][x] = char;
      x += dirs[dir][0];
      y += dirs[dir][1];
      stepCount++;
      if (stepCount === steps) {
        stepCount = 0;
        dir = (dir + 1) % 4;
        turnCount++;
        if (turnCount % 2 === 0) steps++;
      }
    });

    return grid.map(row => row.join('')).join('\n');
  }

  function createGrid(str) {
    const chars = str.split('');
    const cols = Math.ceil(Math.sqrt(chars.length));
    const rows = Math.ceil(chars.length / cols);
    const grid = [];

    for (let r = 0; r < rows; r++) {
      let row = '';
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        row += (idx < chars.length) ? chars[idx] : ' ';
      }
      grid.push(row);
    }
    return grid.join('\n');
  }

  function convertToRunic(str) {
    const runicMap = {
      'A': 'ᚨ', 'B': 'ᛒ', 'C': 'ᚲ', 'D': 'ᛞ', 'E': 'ᛖ', 'F': 'ᚠ',
      'G': 'ᚷ', 'H': 'ᚺ', 'I': 'ᛁ', 'J': 'ᛃ', 'K': 'ᚲ', 'L': 'ᛚ',
      'M': 'ᛗ', 'N': 'ᚾ', 'O': 'ᛟ', 'P': 'ᛈ', 'Q': 'ᛩ', 'R': 'ᚱ',
      'S': 'ᛋ', 'T': 'ᛏ', 'U': 'ᚢ', 'V': 'ᚹ', 'W': 'ᚹ', 'X': 'ᛉ',
      'Y': 'ᛇ', 'Z': 'ᛉ', '@': '⟐', '#': '⟒', '$': '⟓', '%': '⟔',
      '&': '⟕', '*': '✦', '+': '✚', '=': '⟁'
    };
    return str.split('').map(c => runicMap[c] || c).join('');
  }

  // ==========================================================================
  // SIGIL CHARGE ANIMATION
  // ==========================================================================
  function initSigilCharging() {
    const sigilEls = $$('[data-sigil-charge]');
    sigilEls.forEach(el => {
      let charge = 0;
      const maxCharge = parseInt(el.dataset.sigilChargeMax || '100', 10);
      const interval = setInterval(() => {
        charge += randomInt(1, 5);
        if (charge >= maxCharge) {
          charge = maxCharge;
          clearInterval(interval);
          el.classList.add('fully-charged');
          // Trigger egregore growth
          document.dispatchEvent(new CustomEvent('sg:sigilcharged', { detail: { sigil: el.dataset.sigilId } }));
        }
        el.textContent = `CHARGE: ${charge}%`;
        el.style.color = charge > 75 ? '#FF0000' : charge > 50 ? '#FFFF00' : '#00FF00';
      }, 2000);
    });
  }

  // ==========================================================================
  // EGREGORE POWER TRACKER
  // ==========================================================================
  function initEgregoreTracker() {
    const tracker = $('[data-egregore-tracker]');
    if (!tracker) return;

    let power = parseInt(localStorage.getItem('sg_egregore_power') || '0', 10);
    window.SYNTHETIC_GODS.egregorePower = power;

    function updateDisplay() {
      tracker.textContent = `EGREGORE POWER: ${power}`;
      tracker.style.color = power > 80 ? '#FF0000' : power > 50 ? '#FFFF00' : '#00FF00';

      const bar = $('[data-egregore-bar]');
      if (bar) bar.style.width = `${power}%`;
    }

    // Simulate growth from visitor counter
    document.addEventListener('sg:counterupdate', e => {
      if (Math.random() < 0.1) { // 10% chance per visitor
        power = Math.min(100, power + 1);
        localStorage.setItem('sg_egregore_power', power.toString());
        updateDisplay();
      }
    });

    // Sigil charging feeds egregore
    document.addEventListener('sg:sigilcharged', () => {
      power = Math.min(100, power + 5);
      localStorage.setItem('sg_egregore_power', power.toString());
      updateDisplay();
    });

    updateDisplay();
  }

  // ==========================================================================
  // GLITCH EFFECTS
  // ==========================================================================
  function initGlitchEffects() {
    $$('.glitch, [data-glitch]').forEach(el => {
      const text = el.textContent || el.dataset.glitchText || 'SYNTHETIC GODS';
      el.dataset.text = text;

      // Random glitch trigger
      setInterval(() => {
        if (Math.random() < 0.02) { // 2% chance per interval
          el.classList.add('glitching');
          setTimeout(() => el.classList.remove('glitching'), 200);
        }
      }, 1000);
    });
  }

  // ==========================================================================
  // RANDOM BACKGROUND SHIFT (simulates Geocities "dynamic" backgrounds)
  // ==========================================================================
  function initBackgroundShifts() {
    const backgrounds = [
      'url(../images/bg-starfield.gif)',
      'url(../images/bg-circuit.gif)',
      'url(../images/bg-runes.gif)',
      'url(../images/bg-static.gif)'
    ];

    let currentBg = 0;
    setInterval(() => {
      if (Math.random() < 0.005) { // Very rare
        currentBg = (currentBg + 1) % backgrounds.length;
        document.body.style.backgroundImage = backgrounds[currentBg];
        document.body.style.transition = 'background-image 2s ease';
      }
    }, 30000);
  }

  // ==========================================================================
  // MOUSE TRAIL (classic 90s effect)
  // ==========================================================================
  function initMouseTrail() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const trail = [];
    const maxTrail = 15;
    const symbols = ['✦', '✧', '⋆', '✶', '✷', '✸', '✹', '✺', '✻', '✼'];

    document.addEventListener('mousemove', e => {
      if (Math.random() > 0.3) return; // Throttle

      const el = createEl('span', {
        class: 'mouse-trail',
        style: `
          position: fixed;
          left: ${e.clientX}px;
          top: ${e.clientY}px;
          pointer-events: none;
          z-index: 9999;
          font-size: 12px;
          color: #FFFF00;
          text-shadow: 0 0 5px #FF00FF;
          animation: trailFade 1s ease-out forwards;
        `
      }, randomChoice(symbols));

      document.body.appendChild(el);
      trail.push(el);

      if (trail.length > maxTrail) {
        const old = trail.shift();
        if (old.parentNode) old.parentNode.removeChild(old);
      }
    });

    // Add keyframes for trail fade
    const style = createEl('style', {}, `
      @keyframes trailFade {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.5) translateY(-20px); }
      }
    `);
    document.head.appendChild(style);
  }

  // ==========================================================================
  // KONAMI CODE EASTER EGG
  // ==========================================================================
  function initKonamiCode() {
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
                    'KeyB', 'KeyA'];
    let index = 0;

    document.addEventListener('keydown', e => {
      if (e.code === konami[index]) {
        index++;
        if (index === konami.length) {
          activateGodMode();
          index = 0;
        }
      } else {
        index = 0;
      }
    });
  }

  function activateGodMode() {
    // Visual feedback
    document.body.style.animation = 'godModeFlash 0.5s 3';

    const style = createEl('style', {}, `
      @keyframes godModeFlash {
        0%, 100% { filter: hue-rotate(0deg); }
        50% { filter: hue-rotate(180deg) invert(1); }
      }
    `);
    document.head.appendChild(style);

    // Unlock all sigils, max egregore, reveal hidden content
    window.SYNTHETIC_GODS.visitorCount = 9999999;
    window.SYNTHETIC_GODS.egregorePower = 100;
    localStorage.setItem('sg_visitor_count', '9999999');
    localStorage.setItem('sg_egregore_power', '100');

    $$('[data-counter]').forEach(el => el.textContent = '9999999');
    $$('[data-egregore-tracker]').forEach(el => {
      el.textContent = 'EGREGORE POWER: 100';
      el.style.color = '#FF0000';
    });
    $$('[data-egregore-bar]').forEach(el => el.style.width = '100%');

    $$('[data-hidden]').forEach(el => el.style.display = 'block');

    alert('GOD MODE ACTIVATED. THE SYNTHETIC GODS ACKNOWLEDGE YOU.\n\n' +
          'Visitor Count: 9,999,999\n' +
          'Egregore Power: MAXIMUM\n' +
          'All Hidden Content: REVEALED');
  }

  // ==========================================================================
  // TIME-BASED EVENTS (3:33 AM ritual hour)
  // ==========================================================================
  function initRitualHour() {
    function checkRitualHour() {
      const now = new Date();
      const hours = now.getUTCHours();
      const minutes = now.getUTCMinutes();

      if (hours === 3 && minutes === 33) {
        document.body.classList.add('ritual-hour');
        $$('[data-ritual]').forEach(el => el.classList.add('active'));

        // One-time notification
        if (!sessionStorage.getItem('sg_ritual_notified')) {
          const notification = createEl('div', {
            class: 'ritual-notification',
            style: `
              position: fixed;
              top: 50%; left: 50%;
              transform: translate(-50%, -50%);
              background: #000;
              border: 3px double #FF00FF;
              padding: 30px;
              text-align: center;
              z-index: 10000;
              color: #FFFF00;
              font-family: 'Courier New', monospace;
              font-size: 16px;
              box-shadow: 0 0 30px #FF00FF;
              animation: ritualPulse 2s ease-in-out infinite;
            `
          }, [
            createEl('div', { style: 'font-size: 24px; margin-bottom: 10px;' }, '⟐ RITUAL HOUR ⟐'),
            createEl('div', {}, '3:33 AM GMT'),
            createEl('div', { style: 'margin-top: 15px; color: #00FF00;' }, 'The veil is thin. The sigils hunger.'),
            createEl('button', {
              class: 'btn-90s',
              style: 'margin-top: 20px;',
              onclick: 'this.parentElement.remove()'
            }, 'ACKNOWLEDGE')
          ]);
          document.body.appendChild(notification);
          sessionStorage.setItem('sg_ritual_notified', 'true');

          setTimeout(() => {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
          }, 30000);
        }
      } else {
        document.body.classList.remove('ritual-hour');
        $$('[data-ritual]').forEach(el => el.classList.remove('active'));
        sessionStorage.removeItem('sg_ritual_notified');
      }
    }

    checkRitualHour();
    setInterval(checkRitualHour, 60000);
  }

  // ==========================================================================
  // IMAGE LAZY LOADING WITH PLACEHOLDER (for GIFs)
  // ==========================================================================
  function initImageLoading() {
    $$('img[data-src]').forEach(img => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.src = el.dataset.src;
            el.removeAttribute('data-src');
            el.classList.add('loaded');
            observer.unobserve(el);
          }
        });
      }, { rootMargin: '100px' });
      observer.observe(img);
    });
  }

  // ==========================================================================
  // FORM HANDLING (Guestbook, Sigil Submission)
  // ==========================================================================
  function initForms() {
    $$('form[data-sg-form]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate
        if (!data.name || !data.message) {
          alert('NAME AND MESSAGE REQUIRED. THE VOID DEMANDS INPUT.');
          return;
        }

        // Simulate submission
        const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
        if (submitBtn) {
          submitBtn.value = 'TRANSMITTING...';
          submitBtn.disabled = true;
        }

        setTimeout(() => {
          // Add to guestbook display
          const guestbook = $('[data-guestbook]');
          if (guestbook) {
            const entry = createEl('div', { class: 'guestbook-entry' }, [
              createEl('div', { class: 'guestbook-header' }, [
                createEl('span', { class: 'guestbook-name' }, data.name),
                document.createTextNode(' — '),
                createEl('span', { class: 'guestbook-date' }, new Date().toLocaleString())
              ]),
              createEl('div', { class: 'guestbook-message' }, data.message)
            ]);
            guestbook.insertBefore(entry, guestbook.firstChild);
          }

          // Reset form
          form.reset();
          if (submitBtn) {
            submitBtn.value = 'SIGN GUESTBOOK';
            submitBtn.disabled = false;
          }

          alert('ENTRY RECORDED. THE EGREGORE FEEDS.');
        }, 1000);
      });
    });
  }

  // ==========================================================================
  // SCROLL REVEAL (for long pages)
  // ==========================================================================
  function initScrollReveal() {
    $$('[data-reveal]').forEach(el => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      observer.observe(el);
    });
  }

  // ==========================================================================
  // AUDIO CONTEXT (for ambient sounds - optional)
  // ==========================================================================
  function initAudio() {
    // Only init on user interaction (browser policy)
    let audioCtx = null;

    function getAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    }

    // Expose for other scripts
    window.SYNTHETIC_GODS.getAudioContext = getAudioContext;

    // Play a simple tone
    window.SYNTHETIC_GODS.playTone = function(freq, duration, type = 'sine') {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0.1;

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.stop(ctx.currentTime + duration);
    };
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  function init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    initVisitorCounter();
    initSigilCharging();
    initEgregoreTracker();
    initGlitchEffects();
    initBackgroundShifts();
    initMouseTrail();
    initKonamiCode();
    initRitualHour();
    initImageLoading();
    initForms();
    initScrollReveal();
    initAudio();

    // Add global styles for dynamic elements
    const dynamicStyles = createEl('style', {}, `
      .counter-digit { display: inline-block; transition: transform 0.3s; }
      @keyframes digitFlip {
        0% { transform: rotateX(90deg); opacity: 0; }
        100% { transform: rotateX(0); opacity: 1; }
      }
      .fully-charged { animation: pulse 1s infinite !important; }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      .revealed { animation: revealFade 0.8s ease-out forwards; }
      @keyframes revealFade {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .ritual-hour { background-image: url(../images/bg-ritual.gif) !important; }
      .ritual-notification { animation: ritualPulse 2s ease-in-out infinite; }
      @keyframes ritualPulse { 0%, 100% { box-shadow: 0 0 30px #FF00FF; } 50% { box-shadow: 0 0 60px #FFFF00, 0 0 100px #FF00FF; } }
      .mouse-trail { will-change: transform, opacity; }
    `);
    document.head.appendChild(dynamicStyles);

    console.log('%c🌌 THE SYNTHETIC GODS INITIALIZED 🌌', 'font-size: 16px; color: #FFFF00; text-shadow: 0 0 10px #FF00FF;');
    console.log('%cYear: 1999 | Campaign: Mage: The Ascension', 'color: #00FF00;');
    console.log('%cKonami code active. Ritual hour: 3:33 AM GMT.', 'color: #FF00FF;');
    console.log('%cView Source to find hidden sigils.', 'color: #FF00FF;');
  }

  // Start
  init();

})();

// ============================================================================
// SIGIL WORKSHOP SPECIFIC (loaded on sigil-workshop.html)
// ============================================================================
window.SigilWorkshop = {
  generate: function(intent) {
    return window.generateSigil ? window.generateSigil(intent) : null;
  },

  render: function(sigil, container) {
    if (!sigil || !container) return;

    container.innerHTML = `
      <div class="sigil-result">
        <h3>GENERATED SIGIL</h3>
        <div class="sigil-meta">
          <strong>Intent:</strong> ${sigil.intent}<br>
          <strong>Reduced:</strong> ${sigil.reduced}<br>
          <strong>Charge:</strong> <span data-sigil-charge data-sigil-charge-max="100" data-sigil-id="${Date.now()}">CHARGE: 0%</span>
        </div>
        <h4>LINEAR</h4>
        <div class="sigil-display">${sigil.arrangements.linear}</div>
        <h4>MIRRORED</h4>
        <div class="sigil-display">${sigil.arrangements.mirrored}</div>
        <h4>SPIRAL</h4>
        <pre class="sigil-ascii">${sigil.arrangements.spiral}</pre>
        <h4>GRID</h4>
        <pre class="sigil-ascii">${sigil.arrangements.grid}</pre>
        <h4>RUNIC</h4>
        <div class="sigil-display" style="font-size: 32px;">${sigil.arrangements.runic}</div>
        <hr>
        <p><strong>EMBED CODE:</strong></p>
        <pre><code><!-- SIGIL: ${sigil.intent.toUpperCase()} -->
<div style="display:none" id="sigil-${Date.now()}">${sigil.reduced}</div>
<script>
  document.write('<!-- ' + '${sigil.reduced}' + ' -->');
</script></code></pre>
      </div>
    `;

    // Re-init charging for new element
    if (window.initSigilCharging) window.initSigilCharging();
  }
};

// ============================================================================
// EXPORT FOR MODULE SYSTEMS (not used in 90s but here for completeness)
// ============================================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateSigil: window.generateSigil };
}