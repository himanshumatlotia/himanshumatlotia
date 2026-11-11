/**
 * ============================================================
 * HIMANSHU MATLOTIA PORTFOLIO — 3-STAGE ANIMATED CAT EXPERIMENT
 * ============================================================
 * State 1: Hanging & Swaying from hero card edge (Idle/Hover)
 * State 2: Falling Physics — slip anticipation, gravity plunge,
 *          tumbling flips, and squish-impact landing at the bottom.
 * State 3: Dazed Mode — flat on footer ground, dizzy spiral eyes,
 *          and classic Tom & Jerry 3D orbiting golden cartoon stars!
 * Bonus:   Interactive revival! Tap the dazed cat to spring it
 *          all the way back up to the hero card (infinitely replayable).
 * ============================================================
 */

(function () {
  'use strict';

  // Master switch for the experiment (can be easily toggled)
  const EXPERIMENT_ENABLED = true;
  if (!EXPERIMENT_ENABLED) return;
  window.__FALLING_CAT_EXPERIMENT_LOADED = true;

  // Cat State Management: 'hanging' | 'falling' | 'dazed' | 'reviving'
  let currentState = 'hanging';
  let starOrbitRaf = null;
  let starAngle = 0;
  let chimeInterval = null;
  let swayTween = null;

  // Web Audio Context for Authentic Cartoon Sounds
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // 1. CARTOON SOUND GENERATORS
  const CartoonSound = {
    // Startled Meow + Downward Slide Whistle (Drop)
    playFallSound() {
      // Play real audio meow if available
      try {
        const meow = new Audio('assets/meow.mp3');
        meow.playbackRate = 1.18; // slightly pitch-shifted panic meow
        meow.play().catch(() => {});
      } catch (e) {}

      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        // Classic cartoon downward slide whistle: 750Hz down to 130Hz
        osc.frequency.setValueAtTime(750, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(130, now + 1.2);

        // Gentle volume envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
        gain.gain.linearRampToValueAtTime(0.14, now + 1.0);
        gain.gain.linearRampToValueAtTime(0.001, now + 1.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + 0.15);
        osc.stop(now + 1.28);
      } catch (err) {
        console.warn('Audio synthesis error:', err);
      }
    },

    // Comic Splat / Impact Thud
    playSplatSound() {
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      } catch (err) {}
    },

    // Magical Cartoon Twinkle Chime (while stars orbit)
    playStarChime() {
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const notes = [1318.5, 1567.98, 1760, 2093]; // E6, G6, A6, C7
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0.05, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.28);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.32);
        });
      } catch (err) {}
    },

    // Upward Boing / Spring Sound (Revival)
    playBoingSound() {
      try {
        const meow = new Audio('assets/meow.mp3');
        meow.playbackRate = 1.0;
        meow.play().catch(() => {});
      } catch (e) {}

      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        // Upward cartoon spring curve
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.35);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.5);
      } catch (err) {}
    }
  };

  /**
   * Main Initialization
   */
  function initCatFallingExperiment() {
    const catContainer = document.getElementById('hero-hanging-cat');
    const catImg = document.getElementById('hanging-cat-img');
    if (!catContainer || !catImg) return;

    // Build enhanced internal DOM structure if not already present
    setupCatMarkup(catContainer, catImg);

    // Setup speech bubble & scroll hint toast
    setupScrollHintToast();

    // Attach Event Handlers
    setupInteractionHandlers(catContainer, catImg);

    // Auto-trigger for visual testing or direct link if requested
    if (window.location.search.includes('testState=dazed')) {
      const { deltaY, deltaX } = calculateLandingOffset();
      const bodyWrapper = catContainer.querySelector('.cat-body-wrapper') || catImg;
      const bubble = catContainer.querySelector('.cat-meow-bubble');
      gsap.set(catContainer, { y: deltaY, x: deltaX });
      gsap.set(bodyWrapper, { rotation: 720 - 85, scaleY: 0.72, scaleX: 1.15 });
      onCatLanded(catContainer, catImg, bodyWrapper, bubble);
      window.scrollTo(0, 99999);
    } else if (window.location.search.includes('triggerCatFall=true')) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          catContainer.click();
        }, 600);
      });
    }
  }

  /**
   * Inject necessary DOM elements for Orbiting Stars, Dizzy Eyes, and Impact Poofs
   */
  function setupCatMarkup(catContainer, catImg) {
    // If not already wrapped in .cat-body-wrapper, wrap it
    let bodyWrapper = catContainer.querySelector('.cat-body-wrapper');
    if (!bodyWrapper) {
      bodyWrapper = document.createElement('div');
      bodyWrapper.className = 'cat-body-wrapper';
      bodyWrapper.id = 'cat-body-wrapper';

      // Move catImg inside bodyWrapper
      catImg.parentNode.insertBefore(bodyWrapper, catImg);
      bodyWrapper.appendChild(catImg);

      // Inject Dizzy Spiral Eyes inside bodyWrapper
      const dizzyEyes = document.createElement('div');
      dizzyEyes.className = 'cat-dizzy-eyes';
      dizzyEyes.id = 'cat-dizzy-eyes';
      dizzyEyes.setAttribute('aria-hidden', 'true');
      dizzyEyes.innerHTML = `
        <div class="dizzy-eye dizzy-eye--left">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="11" fill="#FFFFFF" stroke="#000000" stroke-width="1.6"/>
            <path d="M12 12 m0 -2 a2 2 0 0 1 2 2 a4 4 0 0 1 -4 4 a6 6 0 0 1 -6 -6 a8 8 0 0 1 8 -8 a10 10 0 0 1 10 10" fill="none" stroke="#FFE600" stroke-width="2.3" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="dizzy-eye dizzy-eye--right">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="11" fill="#FFFFFF" stroke="#000000" stroke-width="1.6"/>
            <path d="M12 12 m0 -2 a2 2 0 0 1 2 2 a4 4 0 0 1 -4 4 a6 6 0 0 1 -6 -6 a8 8 0 0 1 8 -8 a10 10 0 0 1 10 10" fill="none" stroke="#FFE600" stroke-width="2.3" stroke-linecap="round"/>
          </svg>
        </div>
      `;
      bodyWrapper.appendChild(dizzyEyes);
    }

    // Inject Tom & Jerry 3D Orbiting Stars Container
    let starsRig = catContainer.querySelector('.cat-tom-jerry-stars');
    if (!starsRig) {
      starsRig = document.createElement('div');
      starsRig.className = 'cat-tom-jerry-stars';
      starsRig.id = 'cat-tom-jerry-stars';
      starsRig.setAttribute('aria-hidden', 'true');
      starsRig.innerHTML = `
        <svg class="dizzy-center-spiral" viewBox="0 0 36 36">
          <path d="M 18 18 m 0 -1.5 a 1.5 1.5 0 0 1 1.5 1.5 a 3.5 3.5 0 0 1 -3.5 3.5 a 6 6 0 0 1 -6 -6 a 8.5 8.5 0 0 1 8.5 -8.5 a 11.5 11.5 0 0 1 11.5 11.5" fill="none" stroke="#FFD700" stroke-width="2.4" stroke-linecap="round"/>
        </svg>
        <div class="orbiting-star" id="orbit-star-0">
          <svg viewBox="0 0 24 24"><path d="M12 1.5 L15.2 8.3 L22.5 9.3 L17.2 14.5 L18.5 22 L12 18.3 L5.5 22 L6.8 14.5 L1.5 9.3 L8.8 8.3 Z" fill="#FFD700" stroke="#FF9900" stroke-width="1.2" stroke-linejoin="round"/><circle cx="9.5" cy="7.5" r="1.5" fill="#FFFFFF" opacity="0.9"/></svg>
        </div>
        <div class="orbiting-star" id="orbit-star-1">
          <svg viewBox="0 0 24 24"><path d="M12 1.5 L15.2 8.3 L22.5 9.3 L17.2 14.5 L18.5 22 L12 18.3 L5.5 22 L6.8 14.5 L1.5 9.3 L8.8 8.3 Z" fill="#FFD700" stroke="#FF9900" stroke-width="1.2" stroke-linejoin="round"/><circle cx="9.5" cy="7.5" r="1.5" fill="#FFFFFF" opacity="0.9"/></svg>
        </div>
        <div class="orbiting-star" id="orbit-star-2">
          <svg viewBox="0 0 24 24"><path d="M12 1.5 L15.2 8.3 L22.5 9.3 L17.2 14.5 L18.5 22 L12 18.3 L5.5 22 L6.8 14.5 L1.5 9.3 L8.8 8.3 Z" fill="#FFD700" stroke="#FF9900" stroke-width="1.2" stroke-linejoin="round"/><circle cx="9.5" cy="7.5" r="1.5" fill="#FFFFFF" opacity="0.9"/></svg>
        </div>
        <div class="orbiting-star" id="orbit-star-3">
          <svg viewBox="0 0 24 24"><path d="M12 1.5 L15.2 8.3 L22.5 9.3 L17.2 14.5 L18.5 22 L12 18.3 L5.5 22 L6.8 14.5 L1.5 9.3 L8.8 8.3 Z" fill="#FFD700" stroke="#FF9900" stroke-width="1.2" stroke-linejoin="round"/><circle cx="9.5" cy="7.5" r="1.5" fill="#FFFFFF" opacity="0.9"/></svg>
        </div>
      `;
      catContainer.appendChild(starsRig);
    }

    // Comic Impact Poof
    let poof = catContainer.querySelector('.cat-impact-poof');
    if (!poof) {
      poof = document.createElement('div');
      poof.className = 'cat-impact-poof';
      poof.id = 'cat-impact-poof';
      poof.setAttribute('aria-hidden', 'true');
      poof.innerHTML = `
        <span class="poof-circle pc-1"></span>
        <span class="poof-circle pc-2"></span>
        <span class="poof-circle pc-3"></span>
        <span class="poof-circle pc-4"></span>
      `;
      catContainer.appendChild(poof);
    }

    // Speech Bubble
    let bubble = catContainer.querySelector('.cat-meow-bubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'cat-meow-bubble';
      bubble.id = 'cat-speech-bubble';
      bubble.textContent = 'Meow! 🐾';
      catContainer.appendChild(bubble);
    }
  }

  /**
   * Floating Toast Notification shown when the cat falls to guide the user
   */
  function setupScrollHintToast() {
    let toast = document.getElementById('cat-scroll-hint');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cat-scroll-hint';
      toast.className = 'cat-scroll-hint';
      toast.setAttribute('aria-hidden', 'true');
      toast.innerHTML = `
        <span class="cat-hint-icon">🙀</span>
        <div class="cat-hint-text">
          <strong>The cat fell down!</strong>
          <span>Scroll to the footer to check on him!</span>
        </div>
        <button type="button" class="cat-hint-btn" id="cat-hint-scroll-btn" aria-label="Scroll to fallen cat">
          Find Cat ↓
        </button>
      `;
      document.body.appendChild(toast);

      // Button smooth scrolls down to cat
      const btn = toast.querySelector('#cat-hint-scroll-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const footer = document.querySelector('.site-footer') || document.getElementById('contact');
          if (footer) {
            footer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            dismissToast();
          }
        });
      }
    }
  }

  function showToast() {
    const toast = document.getElementById('cat-scroll-hint');
    if (toast) {
      toast.classList.add('visible');
    }
  }

  function dismissToast() {
    const toast = document.getElementById('cat-scroll-hint');
    if (toast) {
      toast.classList.remove('visible');
    }
  }

  /**
   * Set up Hover, Sway, and Click interactions
   */
  function setupInteractionHandlers(catContainer, catImg) {
    const bubble = catContainer.querySelector('.cat-meow-bubble');
    const bodyWrapper = catContainer.querySelector('.cat-body-wrapper') || catImg;

    // Hover in Hanging State
    catContainer.addEventListener('mouseenter', () => {
      if (currentState !== 'hanging') return;

      // Swap to nervous looking-down eyes
      catImg.src = 'assets/hanging-cat-2.png';

      if (typeof gsap !== 'undefined') {
        swayTween = gsap.to(catContainer, {
          rotation: 8,
          duration: 0.38,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });
      }
    });

    // Mouse Leave in Hanging State
    catContainer.addEventListener('mouseleave', () => {
      if (currentState !== 'hanging') return;

      catImg.src = 'assets/hanging-cat-1.png';

      if (swayTween) {
        swayTween.kill();
        swayTween = null;
      }
      if (typeof gsap !== 'undefined') {
        gsap.to(catContainer, {
          rotation: 0,
          duration: 0.4,
          ease: 'elastic.out(1, 0.4)'
        });
      }
    });

    // Primary Click Action: State Machine
    catContainer.addEventListener('click', (e) => {
      e.stopPropagation();

      if (currentState === 'hanging') {
        triggerFallSequence(catContainer, catImg, bodyWrapper, bubble);
      } else if (currentState === 'dazed') {
        triggerReviveSequence(catContainer, catImg, bodyWrapper, bubble);
      }
    });

    // Dismiss scroll hint if user scrolls to footer naturally
    window.addEventListener('scroll', () => {
      if (currentState === 'dazed') {
        const footer = document.querySelector('.site-footer');
        if (footer) {
          const rect = footer.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.75) {
            dismissToast();
          }
        }
      }
    }, { passive: true });
  }

  /**
   * Calculate exact distance from initial hero cat position to the footer baseline
   * Uses invariant parent element positions so it is 100% resilient
   */
  function calculateLandingOffset() {
    const heroCard = document.querySelector('.hero-card');
    const bigName = document.querySelector('.footer-big-name');
    const footer = document.querySelector('.site-footer') || document.getElementById('contact');

    // 1. Initial cat document Y position (anchored to hero-card bottom edge - 44px)
    let catInitialDocY = 400;
    if (heroCard) {
      const heroRect = heroCard.getBoundingClientRect();
      catInitialDocY = (heroRect.top + window.scrollY) + heroCard.offsetHeight - 44;
    }

    // 2. Landing target document Y position in footer (above giant letters)
    let landingDocY = catInitialDocY + 2200;
    if (bigName) {
      const bigRect = bigName.getBoundingClientRect();
      landingDocY = (bigRect.top + window.scrollY) + 38; // nestled comfortably below Mail text, resting on letters
    } else if (footer) {
      const footerRect = footer.getBoundingClientRect();
      landingDocY = (footerRect.bottom + window.scrollY) - 110;
    }

    return {
      deltaY: Math.max(600, landingDocY - catInitialDocY),
      deltaX: 24 // slightly shifted right into open blue space
    };
  }

  /**
   * ============================================================
   * STATE 2: THE FALL PHYSICS SEQUENCE
   * ============================================================
   */
  function triggerFallSequence(catContainer, catImg, bodyWrapper, bubble) {
    if (currentState !== 'hanging') return;
    currentState = 'falling';

    // Kill any active sway
    if (swayTween) {
      swayTween.kill();
      swayTween = null;
    }

    // Play panic audio & start downward slide whistle
    CartoonSound.playFallSound();

    // Show startled bubble
    if (bubble) {
      bubble.textContent = 'WOAAAH! 🙀';
      bubble.classList.add('show');
    }

    // Swap to worried face
    catImg.src = 'assets/hanging-cat-2.png';

    const { deltaY, deltaX } = calculateLandingOffset(catContainer);

    // Fall Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        onCatLanded(catContainer, catImg, bodyWrapper, bubble);
      }
    });

    // 1. Anticipation: Claws losing grip on ledge
    tl.to(catContainer, {
      x: -5,
      duration: 0.04,
      yoyo: true,
      repeat: 3,
      ease: 'linear'
    });

    tl.to(catContainer, {
      y: 18,
      duration: 0.12,
      ease: 'power1.in'
    }, '-=0.04');

    // 2. Hide bubble as it drops
    tl.add(() => {
      if (bubble) bubble.classList.remove('show');
      showToast();
    }, '+=0.05');

    // 3. Gravity Acceleration Down the Page
    // Tumbling rotations: 2 full flips, landing flat rotated at -85deg
    tl.to(catContainer, {
      y: deltaY,
      x: deltaX,
      duration: 1.35,
      ease: 'power2.in'
    }, 'fall');

    tl.to(bodyWrapper, {
      rotation: 720 - 85, // 2 full tumbling flips + rotated flat on floor
      scaleY: 1.25,       // stretch from wind resistance
      scaleX: 0.82,
      duration: 1.35,
      ease: 'power1.in'
    }, 'fall');
  }

  /**
   * ============================================================
   * STATE 3: LANDING & TOM AND JERRY DAZED STARS
   * ============================================================
   */
  function onCatLanded(catContainer, catImg, bodyWrapper, bubble) {
    currentState = 'dazed';
    catContainer.classList.add('cat--dazed');

    // Comic Splat Impact Sound
    CartoonSound.playSplatSound();

    // Impact Squash & Rebound
    gsap.timeline()
      .to(bodyWrapper, {
        scaleY: 0.38,
        scaleX: 1.45,
        duration: 0.08,
        ease: 'power2.out'
      })
      .to(bodyWrapper, {
        scaleY: 0.85,
        scaleX: 0.95,
        duration: 0.14,
        ease: 'power1.out'
      })
      .to(bodyWrapper, {
        scaleY: 0.72,
        scaleX: 1.15,
        duration: 0.22,
        ease: 'elastic.out(1.1, 0.5)'
      });

    // Trigger Comic Impact Poof
    triggerImpactPoof(catContainer);

    // Start 3D Tom & Jerry Orbiting Stars System
    startTomAndJerryStars(catContainer);

    // Start subtle cartoon star chimes
    CartoonSound.playStarChime();
    clearInterval(chimeInterval);
    chimeInterval = setInterval(() => {
      if (currentState === 'dazed') {
        CartoonSound.playStarChime();
      }
    }, 3800);

    // Show dazed speech bubble
    if (bubble) {
      bubble.textContent = 'Stars... 🌟 Tap me!';
      bubble.classList.add('show');
    }
  }

  /**
   * Comic Dust Puff Animation on Landing
   */
  function triggerImpactPoof(catContainer) {
    const poof = catContainer.querySelector('.cat-impact-poof');
    if (!poof) return;

    const circles = poof.querySelectorAll('.poof-circle');
    gsap.fromTo(circles, 
      { scale: 0.2, opacity: 0.95 },
      { 
        scale: 2.2, 
        opacity: 0, 
        duration: 0.45, 
        stagger: 0.04, 
        ease: 'power2.out' 
      }
    );
  }

  /**
   * Tom & Jerry 3D Orbiting Stars Engine
   * Smoothly orbits 4 golden stars along a 3D tilted ellipse around the head
   */
  function startTomAndJerryStars(catContainer) {
    const starsRig = catContainer.querySelector('.cat-tom-jerry-stars');
    if (!starsRig) return;

    starsRig.classList.add('active');
    const starEls = starsRig.querySelectorAll('.orbiting-star');
    const totalStars = starEls.length;

    // Ellipse Radii (tilted 3D perspective)
    const radiusX = 64; // horizontal spread
    const radiusY = 22; // vertical ellipse depth

    function loopOrbit() {
      if (currentState !== 'dazed') return;

      starAngle += 0.052; // smooth cartoon orbit velocity

      starEls.forEach((star, index) => {
        const angle = starAngle + (index * (Math.PI * 2 / totalStars));
        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY;

        // Depth perspective calculation: 0 (back) to 1 (front)
        const depth = (Math.sin(angle) + 1) / 2;
        const scale = 0.65 + depth * 0.65; // scales from 0.65 (distant) to 1.3 (foreground)
        const opacity = 0.55 + depth * 0.45;
        const zIndex = depth > 0.5 ? 25 : 2; // passes in front and behind the head

        // Star spins around its own center
        const spin = (angle * 55) % 360;

        star.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${spin}deg)`;
        star.style.opacity = opacity;
        star.style.zIndex = zIndex;
      });

      starOrbitRaf = requestAnimationFrame(loopOrbit);
    }

    if (starOrbitRaf) cancelAnimationFrame(starOrbitRaf);
    starOrbitRaf = requestAnimationFrame(loopOrbit);
  }

  function stopTomAndJerryStars(catContainer) {
    if (starOrbitRaf) {
      cancelAnimationFrame(starOrbitRaf);
      starOrbitRaf = null;
    }
    clearInterval(chimeInterval);

    const starsRig = catContainer.querySelector('.cat-tom-jerry-stars');
    if (starsRig) {
      // Pop stars outwards into sparkles
      const starEls = starsRig.querySelectorAll('.orbiting-star');
      gsap.to(starEls, {
        scale: 2.2,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
        onComplete: () => {
          starsRig.classList.remove('active');
          gsap.set(starEls, { clearProps: 'all' });
        }
      });
    }
  }

  /**
   * ============================================================
   * BONUS: INTERACTIVE REVIVAL (SPRING BACK UP TO HERO)
   * ============================================================
   */
  function triggerReviveSequence(catContainer, catImg, bodyWrapper, bubble) {
    if (currentState !== 'dazed') return;
    currentState = 'reviving';

    // Play happy meow + spring boing
    CartoonSound.playBoingSound();

    // Dismiss scroll hint toast
    dismissToast();

    // Stop orbiting stars with a puff
    stopTomAndJerryStars(catContainer);

    // Hide dizzy eyes
    catContainer.classList.remove('cat--dazed');

    if (bubble) {
      bubble.textContent = "I'm okay! 😸";
      bubble.classList.add('show');
    }

    // Shake head vigorously to snap out of dizziness
    gsap.timeline()
      .to(bodyWrapper, {
        rotation: '-=25',
        duration: 0.07,
        yoyo: true,
        repeat: 3,
        ease: 'linear'
      })
      .add(() => {
        catImg.src = 'assets/hanging-cat-1.png';
      })
      // Comical Boing Spring: Catapult back up to hero card ledge!
      .to(catContainer, {
        y: 0,
        x: 0,
        duration: 1.15,
        ease: 'back.out(1.2)'
      }, 'spring')
      .to(bodyWrapper, {
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 1.15,
        ease: 'back.out(1.2)'
      }, 'spring')
      .add(() => {
        currentState = 'hanging';
        catContainer.setAttribute('title', 'Click me to play!');
        setTimeout(() => {
          if (bubble) bubble.classList.remove('show');
        }, 1200);
      });
  }

  // Self initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatFallingExperiment);
  } else {
    initCatFallingExperiment();
  }

})();
