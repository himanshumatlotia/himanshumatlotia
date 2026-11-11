/**
 * ============================================================
 * HIMANSHU MATLOTIA PORTFOLIO — CAT INTERACTION LOGIC
 * ============================================================
 * Features:
 *  - Desktop: Follows cursor with gsap.quickTo() and smooth lag
 *  - Horizontal Flip: Cat faces movement direction (scaleX)
 *  - Idle State: After 3 seconds of inactivity, cat rests/breathes
 *  - Hover Reactions: Cat perks up when hovering interactive elements
 *  - Touch Devices: Moves along scroll progress via ScrollTrigger
 *  - Accessibility: Full respects prefers-reduced-motion
 *
 * TUNING GUIDE:
 * Adjust the values in `CAT_CONFIG` below to tweak speeds and behavior.
 * ============================================================
 */

(function () {
  'use strict';

  // ------------------------------------------------------------
  // USER-TUNABLE CONFIGURATION
  // ------------------------------------------------------------
  const CAT_CONFIG = {
    // Follow smoothness (seconds). Lower = snappier, Higher = lazier/floatier
    followDuration: 0.45,
    followEase: 'power2.out',

    // Offset in px from the cursor point so the cat doesn't obscure the cursor tip
    offsetX: 18,
    offsetY: 20,

    // Idle delay (milliseconds) before sitting / breathing animation triggers
    idleTimeoutMs: 3000,

    // Minimum distance (px) required to trigger directional flipping & walking
    moveThreshold: 2.5,

    // Cat visual scale
    desktopScale: 1.0,
    mobileScale: 0.85
  };

  /**
   * Initialize the Cat follower once DOM and GSAP are ready
   */
  function initCat() {
    // Verify GSAP is loaded
    if (typeof gsap === 'undefined') {
      console.warn('[Cat.js] GSAP library not found. Retrying in 100ms...');
      setTimeout(initCat, 100);
      return;
    }

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      console.info('[Cat.js] prefers-reduced-motion enabled. Cat animations disabled.');
      return;
    }

    // Determine path prefix for subfolder support
    const isSubfolder = window.location.pathname.includes('/work/') || window.location.pathname.endsWith('/work');
    const pathPrefix = isSubfolder ? '../' : '';

    // Create or select the cat follower element
    let catEl = document.querySelector('.cat-follower-container');
    if (!catEl) {
      catEl = document.createElement('div');
      catEl.className = 'cat-follower-container';
      catEl.setAttribute('aria-hidden', 'true');
      catEl.innerHTML = `
        <div class="cat-follower-inner">
          <img src="${pathPrefix}assets/cat-follower.svg" alt="Interactive Cat Follower" />
        </div>
      `;
      document.body.appendChild(catEl);
    }

    const catInner = catEl.querySelector('.cat-follower-inner');

    // Create gsap matchMedia instance
    const mm = gsap.matchMedia();

    // ------------------------------------------------------------
    // 1. DESKTOP INTERACTION (POINTER: FINE)
    // ------------------------------------------------------------
    mm.add('(pointer: fine) and (min-width: 768px)', () => {
      let isFirstMove = true;
      let lastX = 0;
      let idleTimer = null;
      let walkTimeout = null;
      let currentDirection = 1; // 1 = right, -1 = left

      // Set initial scale
      gsap.set(catEl, { scale: CAT_CONFIG.desktopScale });

      // Fast, performant quickTo setters for X and Y coordinates
      const setX = gsap.quickTo(catEl, 'x', {
        duration: CAT_CONFIG.followDuration,
        ease: CAT_CONFIG.followEase
      });

      const setY = gsap.quickTo(catEl, 'y', {
        duration: CAT_CONFIG.followDuration,
        ease: CAT_CONFIG.followEase
      });

      /**
       * Reset idle timer on any pointer movement
       */
      function resetIdleTimer() {
        catEl.classList.remove('cat--idle');
        clearTimeout(idleTimer);

        idleTimer = setTimeout(() => {
          // Enter idle state after 3 seconds of stillness
          catEl.classList.add('cat--idle');
          catEl.classList.remove('cat--walking');
        }, CAT_CONFIG.idleTimeoutMs);
      }

      /**
       * Mouse move handler
       */
      function onMouseMove(e) {
        const targetX = e.clientX + CAT_CONFIG.offsetX;
        const targetY = e.clientY + CAT_CONFIG.offsetY;

        if (isFirstMove) {
          // Instantly position cat at cursor on initial entrance
          gsap.set(catEl, { x: targetX, y: targetY, opacity: 1 });
          isFirstMove = false;
        } else {
          setX(targetX);
          setY(targetY);
        }

        // Direction detection (Horizontal flip)
        const deltaX = e.clientX - lastX;
        if (Math.abs(deltaX) > CAT_CONFIG.moveThreshold) {
          const newDirection = deltaX > 0 ? 1 : -1;
          if (newDirection !== currentDirection) {
            currentDirection = newDirection;
            gsap.to(catInner, {
              scaleX: currentDirection,
              duration: 0.18,
              ease: 'power1.out',
              overwrite: 'auto'
            });
          }

          // Trigger walking wobble
          catEl.classList.add('cat--walking');
          clearTimeout(walkTimeout);
          walkTimeout = setTimeout(() => {
            catEl.classList.remove('cat--walking');
          }, 140);
        }

        lastX = e.clientX;
        resetIdleTimer();
      }

      /**
       * Interactive Hover Reactions
       */
      function onElementMouseEnter() {
        catEl.classList.add('cat--hovering');
      }

      function onElementMouseLeave() {
        catEl.classList.remove('cat--hovering');
      }

      // Attach mouse tracking
      window.addEventListener('mousemove', onMouseMove, { passive: true });

      // Setup hover reactions on clickable elements
      const interactiveTargets = document.querySelectorAll('a, button, .hero-hanging-cat, .hero-badge-wrapper');
      interactiveTargets.forEach((target) => {
        target.addEventListener('mouseenter', onElementMouseEnter);
        target.addEventListener('mouseleave', onElementMouseLeave);
      });

      // Cleanup when switching away from desktop media query
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        clearTimeout(idleTimer);
        clearTimeout(walkTimeout);
        interactiveTargets.forEach((target) => {
          target.removeEventListener('mouseenter', onElementMouseEnter);
          target.removeEventListener('mouseleave', onElementMouseLeave);
        });
      };
    });

    // ------------------------------------------------------------
    // 2. TOUCH / MOBILE INTERACTION (SCROLL PROGRESSION)
    // ------------------------------------------------------------
    mm.add('(pointer: coarse), (max-width: 767px)', () => {
      // On mobile devices, dock the cat on the bottom left and make it walk on scroll
      gsap.set(catEl, {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: 'auto',
        top: 'auto',
        x: 0,
        y: 0,
        scale: CAT_CONFIG.mobileScale,
        opacity: 0.92
      });

      if (typeof ScrollTrigger !== 'undefined') {
        let lastScrollY = window.scrollY;

        ScrollTrigger.create({
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - lastScrollY;

            // Flip based on scroll direction
            if (scrollDelta > 0) {
              gsap.to(catInner, { scaleX: 1, duration: 0.2 });
            } else if (scrollDelta < 0) {
              gsap.to(catInner, { scaleX: -1, duration: 0.2 });
            }

            // Brief walking wobble on scroll
            catEl.classList.add('cat--walking');
            gsap.delayedCall(0.2, () => {
              catEl.classList.remove('cat--walking');
            });

            lastScrollY = currentScrollY;
          }
        });
      }

      return () => {
        // Reset styles when exiting touch mode
        gsap.set(catEl, { clearProps: 'all' });
      };
    });
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCat);
  } else {
    initCat();
  }

})();
