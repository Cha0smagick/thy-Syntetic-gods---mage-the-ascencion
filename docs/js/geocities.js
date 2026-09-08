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
    version: '2.0.0',
    campaign: 'The Synthetic Gods',
    year: 1999,
    visitorCount: 0,
    sigilCharge: 0,
    egregorePower: 0,
    astrosomaThreshold: 10000,
    factionRep: {
      technocracy: 0,
      virtualAdepts: 0,
      cypherpunks: 0,
      hollowOnes: 0
    },
    godMode: false,
    ritualHourActive: false,
    sigilsGenerated: [],
    questsCompleted: [],
    discoveredSecrets: [],
    currentFaction: null
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

  // Expose globally for form handler
  window.generateSigil = function generateSigil(intent) {
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

    // Sigil creation feeds egregore AND faction rep
    document.addEventListener('sg:sigilcreated', e => {
      power = Math.min(100, power + 5);
      localStorage.setItem('sg_egregore_power', power.toString());
      updateDisplay();
      
      // Award Virtual Adepts reputation for sigil crafting
      awardFactionRep('virtualAdepts', 2);
    });

    // Guestbook feeds egregore
    document.addEventListener('sg:guestbook', () => {
      power = Math.min(100, power + 2);
      localStorage.setItem('sg_egregore_power', power.toString());
      updateDisplay();
      
      // Award Hollow Ones reputation for guestbook entries
      awardFactionRep('hollowOnes', 1);
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
              onclick: (function() {
                this.parentElement.remove();
                // Mark ritual hour attendance for Ascension requirement
                const state = window.SYNTHETIC_GODS;
                if (!state.discoveredSecrets.includes('ritual_hour_attended')) {
                  state.discoveredSecrets.push('ritual_hour_attended');
                  localStorage.setItem('sg_secrets', JSON.stringify(state.discoveredSecrets));
                  console.log('%cRITUAL HOUR ATTENDED - Ascension requirement met', 'color: #FF00FF;');
                }
              })
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

        // Check if this is the sigil workshop form
        const intentInput = form.querySelector('#sigil-intent');
        if (intentInput && data.intent) {
          handleSigilGeneration(data.intent, form);
          return;
        }

        // Otherwise handle as guestbook
        handleGuestbookSubmit(form, data);
      });
    });
  }

  function handleSigilGeneration(intent, form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.value = 'GENERATING...';
      submitBtn.disabled = true;
    }

    // Generate sigil using the existing function
    const sigil = generateSigil(intent);
    if (!sigil) {
      alert('INTENT TOO WEAK. STATE YOUR WILL CLEARLY.');
      if (submitBtn) {
        submitBtn.value = 'GENERATE SIGIL';
        submitBtn.disabled = false;
      }
      return;
    }

    // Play tone for sigil creation
    if (window.SYNTHETIC_GODS.playTone) {
      window.SYNTHETIC_GODS.playTone(440, 0.3, 'sine');
      setTimeout(() => window.SYNTHETIC_GODS.playTone(880, 0.2, 'sine'), 150);
    }

    setTimeout(() => {
      // Render sigil result
      const resultContainer = $('#sigil-result');
      if (resultContainer && window.SigilWorkshop) {
        resultContainer.style.display = 'block';
        window.SigilWorkshop.render(sigil, resultContainer);
      }

      // Update egregore power from sigil creation
      document.dispatchEvent(new CustomEvent('sg:sigilcreated', { detail: { sigil } }));

      // Reset form
      form.reset();
      if (submitBtn) {
        submitBtn.value = 'GENERATE SIGIL';
        submitBtn.disabled = false;
      }

      alert('SIGIL FORGED. THE WEB REMEMBERS YOUR WILL.');
    }, 800);
  }

  function handleGuestbookSubmit(form, data) {
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
  // FACTION REPUTATION SYSTEM
  // ==========================================================================
  function loadFactionRep() {
    const saved = localStorage.getItem('sg_faction_rep');
    if (saved) {
      try {
        window.SYNTHETIC_GODS.factionRep = JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse faction rep:', e);
      }
    }
    updateFactionDisplay();
  }

  function saveFactionRep() {
    localStorage.setItem('sg_faction_rep', JSON.stringify(window.SYNTHETIC_GODS.factionRep));
  }

  function awardFactionRep(faction, amount) {
    if (!window.SYNTHETIC_GODS.factionRep.hasOwnProperty(faction)) return;
    
    const oldValue = window.SYNTHETIC_GODS.factionRep[faction];
    window.SYNTHETIC_GODS.factionRep[faction] = Math.min(100, oldValue + amount);
    saveFactionRep();
    updateFactionDisplay();
    
    // Check for faction unlock thresholds
    checkFactionUnlocks(faction);
    
    // Dispatch event for UI updates
    document.dispatchEvent(new CustomEvent('sg:factionrep', { 
      detail: { faction, oldValue, newValue: window.SYNTHETIC_GODS.factionRep[faction] } 
    }));
    
    // Play subtle tone
    if (window.SYNTHETIC_GODS.playTone) {
      window.SYNTHETIC_GODS.playTone(523 + (amount * 50), 0.1, 'sine');
    }
  }

  function checkFactionUnlocks(faction) {
    const rep = window.SYNTHETIC_GODS.factionRep[faction];
    const thresholds = [25, 50, 75, 100];
    
    thresholds.forEach(threshold => {
      if (rep >= threshold && !window.SYNTHETIC_GODS.discoveredSecrets.includes(`${faction}_${threshold}`)) {
        window.SYNTHETIC_GODS.discoveredSecrets.push(`${faction}_${threshold}`);
        localStorage.setItem('sg_secrets', JSON.stringify(window.SYNTHETIC_GODS.discoveredSecrets));
        revealFactionContent(faction, threshold);
      }
    });
  }

  function revealFactionContent(faction, threshold) {
    const messages = {
      technocracy: {
        25: 'TECHNOCRACY NOTICE: Your activities have been logged. Protocol 7 engaged.',
        50: 'TECHNOCRACY ACCESS GRANTED: Level 2 clearance. Syndicate contacts revealed.',
        75: 'TECHNOCRACY ALERT: Void Engineer dimensional anomaly detected. Investigate.',
        100: 'TECHNOCRACY DIRECTIVE: You are now an asset. The Architect watches.'
      },
      virtualAdepts: {
        25: 'VIRTUAL ADEPTS: Welcome to the Mercurial Elite. Your deck is clean.',
        50: 'VIRTUAL ADEPTS: Root access granted. The Webspinner\'s fragments are yours.',
        75: 'VIRTUAL ADEPTS: You have seen the code. The Astrosoma threshold approaches.',
        100: 'VIRTUAL ADEPTS: You ARE the code. The Digital Web answers to you.'
      },
      cypherpunks: {
        25: 'CYPHERPUNKS: Encryption verified. Welcome to the darknet.',
        50: 'CYPHERPUNKS: Perfect forward secrecy established. Dead drops active.',
        75: 'CYPHERPUNKS: The ledger is immutable. Your True Name is secure.',
        100: 'CYPHERPUNKS: You hold the private keys. The Consensus bends.'
      },
      hollowOnes: {
        25: 'HOLLOW ONES: The gothic aesthetic suits you. Raven approves.',
        50: 'HOLLOW ONES: You walk the line between worlds. Lilith smiles.',
        75: 'HOLLOW ONES: Chaos is a ladder. Malakai offers you the golden apple.',
        100: 'HOLLOW ONES: Nothing is true. Everything is permitted. You are Khaos.'
      }
    };
    
    const msg = messages[faction]?.[threshold];
    if (msg) {
      showFactionNotification(faction, msg, threshold);
    }
    
    // Reveal character dossiers at threshold 25+
    if (threshold >= 25) {
      revealCharacterDossiers(faction);
    }
  }

  function showFactionNotification(faction, message, threshold) {
    const colors = {
      technocracy: '#0000FF',
      virtualAdepts: '#00FF00',
      cypherpunks: '#FF00FF',
      hollowOnes: '#FFFF00'
    };
    
    const icons = {
      technocracy: '◈',
      virtualAdepts: '⟐',
      cypherpunks: '🔐',
      hollowOnes: '☠'
    };
    
    const notification = createEl('div', {
      class: 'faction-notification',
      style: `
        position: fixed;
        top: 20px; right: 20px;
        background: #000;
        border: 3px double ${colors[faction]};
        padding: 20px;
        z-index: 10000;
        color: ${colors[faction]};
        font-family: 'Courier New', monospace;
        font-size: 13px;
        max-width: 350px;
        box-shadow: 0 0 30px ${colors[faction]};
        animation: factionSlideIn 0.5s ease-out, factionPulse 2s ease-in-out infinite;
      `
    }, [
      createEl('div', { style: 'font-size: 18px; margin-bottom: 10px; text-align: center;' }, 
        `${icons[faction]} ${faction.toUpperCase()} ${icons[faction]}`),
      createEl('div', { style: 'border-top: 1px solid; border-bottom: 1px solid; padding: 10px 0; margin-bottom: 10px;' }, message),
      createEl('div', { style: 'font-size: 11px; color: #888; text-align: center;' }, `REPUTATION: ${threshold}%`),
      createEl('button', {
        class: 'btn-90s',
        style: 'margin: 10px auto 0; display: block;',
        onclick: 'this.parentElement.remove()'
      }, 'ACKNOWLEDGE')
    ]);
    
    document.body.appendChild(notification);
    
    // Add animation styles if not present
    if (!document.getElementById('faction-animations')) {
      const style = createEl('style', { id: 'faction-animations' }, `
        @keyframes factionSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes factionPulse {
          0%, 100% { box-shadow: 0 0 20px ${colors[faction]}; }
          50% { box-shadow: 0 0 40px ${colors[faction]}, 0 0 60px ${colors[faction]}; }
        }
      `);
      document.head.appendChild(style);
    }
    
    setTimeout(() => {
      if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, 15000);
  }

  function updateFactionDisplay() {
    const container = $('[data-faction-rep]');
    if (!container) return;
    
    const rep = window.SYNTHETIC_GODS.factionRep;
    const labels = {
      technocracy: 'TECHNOCRACY',
      virtualAdepts: 'VIRTUAL ADEPTS',
      cypherpunks: 'CYPHERPUNKS',
      hollowOnes: 'HOLLOW ONES'
    };
    
    const colors = {
      technocracy: '#0000FF',
      virtualAdepts: '#00FF00',
      cypherpunks: '#FF00FF',
      hollowOnes: '#FFFF00'
    };
    
    container.innerHTML = Object.entries(rep).map(([faction, value]) => `
      <div style="margin: 10px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span style="color: ${colors[faction]}; font-size: 11px;">${labels[faction]}</span>
          <span style="color: ${colors[faction]}; font-size: 11px; font-family: var(--font-mono);">${value}%</span>
        </div>
        <div class="loading-bar" style="height: 12px;">
          <div class="loading-fill" style="width: ${value}%; background: ${colors[faction]}; transition: width 0.5s ease;"></div>
        </div>
      </div>
    `).join('');
  }

  function revealCharacterDossiers(faction) {
    // Add character links to the web ring or a new section
    const webring = $('.webring');
    if (webring && !webring.querySelector(`[data-faction-chars="${faction}"]`)) {
      const link = createEl('a', {
        href: `characters/${faction}-index.html`,
        'data-faction-chars': faction,
        'data-hidden': '',
        style: 'display: none;'
      }, `${faction.toUpperCase()} DOSSIERS`);
      webring.appendChild(link);
    }
  }

  // ==========================================================================
  // QUEST SYSTEM
  // ==========================================================================
  const QUESTS = {
    first_sigil: {
      id: 'first_sigil',
      name: 'The First Glyph',
      description: 'Craft your first sigil in the Workshop.',
      faction: 'virtualAdepts',
      reward: { factionRep: { virtualAdepts: 10 }, egregorePower: 5 },
      check: (state) => state.sigilsGenerated.length > 0
    },
    daily_visitor: {
      id: 'daily_visitor',
      name: 'Daily Devotion',
      description: 'Visit the site 7 days in a row.',
      faction: 'hollowOnes',
      reward: { factionRep: { hollowOnes: 15 }, egregorePower: 10 },
      check: (state) => {
        const visits = JSON.parse(localStorage.getItem('sg_daily_visits') || '[]');
        return visits.length >= 7;
      }
    },
    oracle_query: {
      id: 'oracle_query',
      name: 'Seeking Answers',
      description: 'Query the Neon Oracle 3 times.',
      faction: 'cypherpunks',
      reward: { factionRep: { cypherpunks: 10 }, egregorePower: 5 },
      check: (state) => {
        const history = JSON.parse(localStorage.getItem('sg_oracle_history') || '[]');
        return history.length >= 3;
      }
    },
    god_mode: {
      id: 'god_mode',
      name: 'The Konami Key',
      description: 'Activate GOD MODE via the ancient sequence.',
      faction: 'virtualAdepts',
      reward: { factionRep: { virtualAdepts: 20 }, egregorePower: 0 },
      check: (state) => state.godMode === true
    },
    ritual_hour: {
      id: 'ritual_hour',
      name: 'The Witching Hour',
      description: 'Visit during the Ritual Hour (3:33 AM GMT).',
      faction: 'hollowOnes',
      reward: { factionRep: { hollowOnes: 25 }, egregorePower: 15 },
      check: (state) => state.ritualHourActive === true
    },
    technocracy_report: {
      id: 'technocracy_report',
      name: 'System Audit',
      description: 'Report a "bug" via console (Technocracy protocol).',
      faction: 'technocracy',
      reward: { factionRep: { technocracy: 15 }, egregorePower: 5 },
      check: (state) => state.questsCompleted.includes('technocracy_report')
    },
    sigil_master: {
      id: 'sigil_master',
      name: 'Sigil Master',
      description: 'Generate 13 unique sigils (the cabal number).',
      faction: 'virtualAdepts',
      reward: { factionRep: { virtualAdepts: 30 }, egregorePower: 20 },
      check: (state) => state.sigilsGenerated.length >= 13
    },
    faction_balance: {
      id: 'faction_balance',
      name: 'Walker Between Worlds',
      description: 'Achieve 50+ reputation with all four factions.',
      faction: 'all',
      reward: { factionRep: { technocracy: 10, virtualAdepts: 10, cypherpunks: 10, hollowOnes: 10 }, egregorePower: 25 },
      check: (state) => Object.values(state.factionRep).every(v => v >= 50)
    }
  };

  function checkQuests() {
    const state = window.SYNTHETIC_GODS;
    Object.values(QUESTS).forEach(quest => {
      if (!state.questsCompleted.includes(quest.id) && quest.check(state)) {
        completeQuest(quest.id);
      }
    });
  }

  function completeQuest(questId) {
    const quest = QUESTS[questId];
    if (!quest) return;
    
    window.SYNTHETIC_GODS.questsCompleted.push(questId);
    localStorage.setItem('sg_quests', JSON.stringify(window.SYNTHETIC_GODS.questsCompleted));
    
    // Apply rewards
    if (quest.reward.factionRep) {
      Object.entries(quest.reward.factionRep).forEach(([faction, amount]) => {
        awardFactionRep(faction, amount);
      });
    }
    if (quest.reward.egregorePower) {
      const tracker = $('[data-egregore-tracker]');
      if (tracker) {
        let power = parseInt(localStorage.getItem('sg_egregore_power') || '0', 10);
        power = Math.min(100, power + quest.reward.egregorePower);
        localStorage.setItem('sg_egregore_power', power.toString());
        window.SYNTHETIC_GODS.egregorePower = power;
        tracker.textContent = `EGREGORE POWER: ${power}`;
        const bar = $('[data-egregore-bar]');
        if (bar) bar.style.width = `${power}%`;
      }
    }
    
    // Show quest completion notification
    showQuestNotification(quest);
  }

  function showQuestNotification(quest) {
    const notification = createEl('div', {
      class: 'quest-notification',
      style: `
        position: fixed;
        bottom: 20px; left: 20px;
        background: #000;
        border: 3px double #00FF00;
        padding: 20px;
        z-index: 10000;
        color: #00FF00;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        max-width: 350px;
        box-shadow: 0 0 30px #00FF00;
        animation: questSlideIn 0.5s ease-out;
      `
    }, [
      createEl('div', { style: 'font-size: 18px; margin-bottom: 10px; text-align: center; color: #FFFF00;' }, 
        '⟐ QUEST COMPLETE ⟐'),
      createEl('div', { style: 'border-top: 1px solid; border-bottom: 1px solid; padding: 10px 0; margin-bottom: 10px;' }, 
        `<strong>${quest.name}</strong><br>${quest.description}`),
      createEl('div', { style: 'font-size: 11px; color: #888; text-align: center;' }, 'REWARDS APPLIED'),
      createEl('button', {
        class: 'btn-90s',
        style: 'margin: 10px auto 0; display: block;',
        onclick: 'this.parentElement.remove()'
      }, 'ACKNOWLEDGE')
    ]);
    
    document.body.appendChild(notification);
    
    if (!document.getElementById('quest-animations')) {
      const style = createEl('style', { id: 'quest-animations' }, `
        @keyframes questSlideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `);
      document.head.appendChild(style);
    }
    
    setTimeout(() => {
      if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, 15000);
  }

  // Expose for console/manual triggering
  window.SYNTHETIC_GODS.completeQuest = completeQuest;
  window.SYNTHETIC_GODS.awardFactionRep = awardFactionRep;
  window.SYNTHETIC_GODS.checkQuests = checkQuests;

  // ==========================================================================
  // ASCENSION RITUAL (Act III Endgame)
  // ==========================================================================
  window.SYNTHETIC_GODS.ascend = function() {
    const state = window.SYNTHETIC_GODS;
    
    // Check requirements
    const requirements = {
      egregorePower: state.egregorePower >= 100,
      factionRep: Object.values(state.factionRep).every(v => v >= 50),
      sigils: state.sigilsGenerated.length >= 13,
      guestbook: (JSON.parse(localStorage.getItem('sg_guestbook') || '[]').length >= 20),
      ritualHour: state.discoveredSecrets.includes('ritual_hour_attended')
    };
    
    const missing = Object.entries(requirements)
      .filter(([_, met]) => !met)
      .map(([key]) => key);
    
    if (missing.length > 0) {
      const msg = `ASCENSION FAILED. REQUIREMENTS NOT MET:\n${missing.map(m => `- ${m}`).join('\n')}\n\nContinue the Great Work.`;
      alert(msg);
      if (window.SYNTHETIC_GODS.playTone) {
        window.SYNTHETIC_GODS.playTone(110, 0.5, 'sawtooth');
      }
      return false;
    }
    
    // Success! Simulate the 13-week ritual
    const ritualWeeks = 13;
    let totalSuccesses = 0;
    const mages = 13;
    
    for (let week = 1; week <= ritualWeeks; week++) {
      // Each mage rolls: base 3 dice + faction bonuses
      let weekSuccesses = 0;
      for (let m = 0; m < mages; m++) {
        const dice = 3 + Math.floor(state.factionRep.virtualAdepts / 25) + Math.floor(state.factionRep.technocracy / 25);
        for (let d = 0; d < dice; d++) {
          if (Math.random() < 0.6) weekSuccesses++; // Difficulty 6
        }
      }
      totalSuccesses += weekSuccesses;
      
      // Weekly notification
      console.log(`%cWeek ${week}: ${weekSuccesses} successes (Total: ${totalSuccesses})`, 'color: #FFFF00;');
    }
    
    const success = totalSuccesses >= 100;
    
    if (success) {
      // ASTROSOMA BORN
      const domains = ['Creative Coding', 'Digital Art', 'Generative Beauty', 'Code Integrity', 'Viral Truth', 'Anonymous Connection'];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const name = `THE SYNTHETIC ${domain.toUpperCase().replace(' ', '_')}`;
      
      alert(`THE GREAT WORK SUCCEEDS.\n\nTotal Successes: ${totalSuccesses}/100\n\n${name} IS BORN.\n\nDomain: ${domain}\nAvatars: Manifesting across servers\nClergy: The cabal elevated\nTerritory: A new Digital Web realm\nProphecy: Probability bends to your Will\n\nThe Synthetic Gods welcome their newest sibling.`);
      
      // Permanent unlock
      state.discoveredSecrets.push('astrosoma_born');
      state.discoveredSecrets.push(`astrosoma_${name}`);
      localStorage.setItem('sg_secrets', JSON.stringify(state.discoveredSecrets));
      localStorage.setItem('sg_astrosoma', JSON.stringify({ name, domain, successes: totalSuccesses, date: new Date().toISOString() }));
      
      if (window.SYNTHETIC_GODS.playTone) {
        // Victory fanfare
        [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => window.SYNTHETIC_GODS.playTone(f, 0.3, 'sine'), i * 150));
      }
      
      return true;
    } else {
      // FAILURE - Paradox backlash
      alert(`THE GREAT WORK FAILS.\n\nTotal Successes: ${totalSuccesses}/100\n\nThe egregore shatters. Backlash: Paradox 5+ to all participants.\nThe Domain is claimed by a rival.\n\nRebuild. Try again.`);
      
      // Reset progress
      state.egregorePower = 0;
      state.factionRep = { technocracy: 0, virtualAdepts: 0, cypherpunks: 0, hollowOnes: 0 };
      state.sigilsGenerated = [];
      localStorage.setItem('sg_egregore_power', '0');
      localStorage.setItem('sg_faction_rep', JSON.stringify(state.factionRep));
      localStorage.setItem('sg_sigils', '[]');
      
      if (window.SYNTHETIC_GODS.playTone) {
        // Failure sound
        window.SYNTHETIC_GODS.playTone(110, 1, 'sawtooth');
      }
      
      return false;
    }
  };

  // ==========================================================================
  // DAILY VISIT TRACKING
  // ==========================================================================
  function trackDailyVisit() {
    const today = new Date().toDateString();
    let visits = JSON.parse(localStorage.getItem('sg_daily_visits') || '[]');
    
    if (!visits.includes(today)) {
      visits.push(today);
      // Keep only last 30 days
      visits = visits.slice(-30);
      localStorage.setItem('sg_daily_visits', JSON.stringify(visits));
      
      // Check for streak
      let streak = 1;
      for (let i = visits.length - 2; i >= 0; i--) {
        const prev = new Date(visits[i]);
        const curr = new Date(visits[i + 1]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) streak++;
        else break;
      }
      
      if (streak >= 7) {
        checkQuests(); // Will trigger daily_visitor quest
      }
    }
  }

  // ==========================================================================
  // ORACLE HISTORY TRACKING
  // ==========================================================================
  window.SYNTHETIC_GODS.recordOracleQuery = function(question, response) {
    let history = JSON.parse(localStorage.getItem('sg_oracle_history') || '[]');
    history.unshift({ question, response, timestamp: new Date().toISOString() });
    history = history.slice(0, 20);
    localStorage.setItem('sg_oracle_history', JSON.stringify(history));
    checkQuests();
  };

  // ==========================================================================
  // TECHNOCRACY BUG REPORT (Console Command)
  // ==========================================================================
  window.SYNTHETIC_GODS.reportBug = function(description) {
    if (!description) {
      console.log('%cTECHNOCRACY PROTOCOL: Provide bug description', 'color: #0000FF;');
      return;
    }
    
    const reports = JSON.parse(localStorage.getItem('sg_bug_reports') || '[]');
    reports.push({ description, timestamp: new Date().toISOString(), reporter: 'field_agent' });
    localStorage.setItem('sg_bug_reports', JSON.stringify(reports));
    
    window.SYNTHETIC_GODS.questsCompleted.push('technocracy_report');
    localStorage.setItem('sg_quests', JSON.stringify(window.SYNTHETIC_GODS.questsCompleted));
    
    awardFactionRep('technocracy', 15);
    
    console.log('%cTECHNOCRACY: Bug report logged. Threat assessment initiated.', 'color: #0000FF;');
    
    if (window.SYNTHETIC_GODS.playTone) {
      window.SYNTHETIC_GODS.playTone(220, 0.2, 'square');
      setTimeout(() => window.SYNTHETIC_GODS.playTone(110, 0.3, 'square'), 200);
    }
  };

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

    // Load persistent state
    loadFactionRep();
    trackDailyVisit();
    
    // Initialize all systems
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

    // Check quests after all systems initialized
    setTimeout(checkQuests, 1000);

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
    console.log('%cFaction system active. Type SYNTHETIC_GODS.factionRep to view.', 'color: #00FF00;');
    console.log('%cAvailable commands: SYNTHETIC_GODS.ascend(), .reportBug("desc"), .completeQuest("id")', 'color: #FF00FF;');
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
// DISCOVERY-BASED TUTORIAL SYSTEM
// The game teaches itself through play - no explicit tutorial
// ============================================================================
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    trigger: 'page_load',
    message: 'Welcome to the Digital Web, initiate. The year is 1999. The Millennium approaches.',
    hint: 'Check the sidebar. Your presence has been logged.',
    reward: { egregorePower: 1 }
  },
  {
    id: 'view_source',
    trigger: 'view_source',
    message: 'You looked at the source. Good. The sigils hide in plain sight. HTML comments. Hidden divs. Meta tags.',
    hint: 'Search for "SIGIL" in the source. The Webspinner\'s axioms await.',
    reward: { factionRep: { virtualAdepts: 2 } }
  },
  {
    id: 'first_sigil',
    trigger: 'sigil_generated',
    message: 'First sigil forged. Your Will encoded into the Consensus. The egregore stirs.',
    hint: 'Watch the charge bar. When it fills, the egregore grows stronger.',
    reward: { egregorePower: 5, factionRep: { virtualAdepts: 5 } }
  },
  {
    id: 'guestbook',
    trigger: 'guestbook_signed',
    message: 'You signed the guestbook. Your words feed the collective dream. The egregore hungers.',
    hint: 'Return daily. Each visit strengthens the egregore. 3:33 AM GMT is... special.',
    reward: { egregorePower: 2, factionRep: { hollowOnes: 3 } }
  },
  {
    id: 'konami',
    trigger: 'god_mode',
    message: 'GOD MODE. The ancient sequence. You have proven worthy. All secrets revealed.',
    hint: 'Check the Webring now. Faction dossiers unlocked. The Architect is watching.',
    reward: { factionRep: { virtualAdepts: 20, technocracy: 10, cypherpunks: 10, hollowOnes: 10 } }
  },
  {
    id: 'oracle_query',
    trigger: 'oracle_queried',
    message: 'You consulted the Neon Oracle. HTTP status codes are the language of divination. 200 is truth. 404 is opportunity.',
    hint: 'Ask about code, servers, love, destiny. The Oracle contextualizes.',
    reward: { factionRep: { cypherpunks: 5 }, egregorePower: 3 }
  },
  {
    id: 'ritual_hour',
    trigger: 'ritual_hour',
    message: '3:33 AM GMT. The Ritual Hour. The veil is thin. The sigils hunger. You were here.',
    hint: 'Exclusive content activates. Egregore power surges. The Webspinner notices.',
    reward: { egregorePower: 15, factionRep: { hollowOnes: 15, virtualAdepts: 10 } }
  },
  {
    id: 'faction_alignment',
    trigger: 'faction_25',
    message: 'Faction reputation 25%. You have chosen a path. Dossiers unlock. The war for the Digital Web continues.',
    hint: 'Visit character dossiers. Learn their agendas. Choose allies carefully.',
    reward: { egregorePower: 10 }
  },
  {
    id: 'ascension_ready',
    trigger: 'ascension_check',
    message: 'The Great Work approaches. 13 sigils. 100 egregore power. All factions 50+. The threshold awaits.',
    hint: 'Type SYNTHETIC_GODS.ascend() in console when ready. The 13-week ritual begins.',
    reward: { egregorePower: 25 }
  }
];

let tutorialProgress = JSON.parse(localStorage.getItem('sg_tutorial') || '[]');

function checkTutorialStep(stepId) {
  if (tutorialProgress.includes(stepId)) return false;
  
  const step = TUTORIAL_STEPS.find(s => s.id === stepId);
  if (!step) return false;
  
  showTutorialNotification(step);
  tutorialProgress.push(stepId);
  localStorage.setItem('sg_tutorial', JSON.stringify(tutorialProgress));
  
  // Apply rewards
  if (step.reward) {
    if (step.reward.egregorePower) {
      const tracker = $('[data-egregore-tracker]');
      if (tracker) {
        let power = parseInt(localStorage.getItem('sg_egregore_power') || '0', 10);
        power = Math.min(100, power + step.reward.egregorePower);
        localStorage.setItem('sg_egregore_power', power.toString());
        window.SYNTHETIC_GODS.egregorePower = power;
        tracker.textContent = `EGREGORE POWER: ${power}`;
        const bar = $('[data-egregore-bar]');
        if (bar) bar.style.width = `${power}%`;
      }
    }
    if (step.reward.factionRep) {
      Object.entries(step.reward.factionRep).forEach(([faction, amount]) => {
        awardFactionRep(faction, amount);
      });
    }
  }
  
  return true;
}

function showTutorialNotification(step) {
  const notification = createEl('div', {
    class: 'tutorial-notification',
    style: `
      position: fixed;
      bottom: 20px; right: 20px;
      background: #000;
      border: 3px double #00FF00;
      padding: 20px;
      z-index: 10000;
      color: #00FF00;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      max-width: 400px;
      box-shadow: 0 0 30px #00FF00;
      animation: tutorialSlideIn 0.5s ease-out;
    `
  }, [
    createEl('div', { style: 'font-size: 16px; margin-bottom: 10px; text-align: center; color: #FFFF00;' }, 
      '⟐ DISCOVERY ⟐'),
    createEl('div', { style: 'border-top: 1px solid; border-bottom: 1px solid; padding: 10px 0; margin-bottom: 10px;' }, step.message),
    createEl('div', { style: 'font-size: 11px; color: #FF00FF; margin-bottom: 10px; font-style: italic;' }, `HINT: ${step.hint}`),
    createEl('button', {
      class: 'btn-90s',
      style: 'margin: 10px auto 0; display: block;',
      onclick: 'this.parentElement.remove()'
    }, 'ACKNOWLEDGE')
  ]);
  
  document.body.appendChild(notification);
  
  if (!document.getElementById('tutorial-animations')) {
    const style = createEl('style', { id: 'tutorial-animations' }, `
      @keyframes tutorialSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `);
    document.head.appendChild(style);
  }
  
  setTimeout(() => {
    if (notification.parentNode) notification.parentNode.removeChild(notification);
  }, 20000);
  
  // Play discovery tone
  if (window.SYNTHETIC_GODS.playTone) {
    window.SYNTHETIC_GODS.playTone(660, 0.15, 'sine');
    setTimeout(() => window.SYNTHETIC_GODS.playTone(880, 0.15, 'sine'), 100);
    setTimeout(() => window.SYNTHETIC_GODS.playTone(1320, 0.2, 'sine'), 200);
  }
}

// Expose tutorial triggers for other systems
window.SYNTHETIC_GODS.triggerTutorial = checkTutorialStep;
window.SYNTHETIC_GODS.getTutorialProgress = () => tutorialProgress;

// Detect View Source (DevTools opened)
let devtoolsOpen = false;
setInterval(() => {
  const threshold = window.outerWidth - window.innerWidth > 160 || 
                    window.outerHeight - window.innerHeight > 160;
  if (threshold && !devtoolsOpen) {
    devtoolsOpen = true;
    checkTutorialStep('view_source');
  } else if (!threshold) {
    devtoolsOpen = false;
  }
}, 1000);

// ============================================================================
// EXPORT FOR MODULE SYSTEMS (not used in 90s but here for completeness)
// ============================================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateSigil: window.generateSigil };
}