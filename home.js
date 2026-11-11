/**
 * ============================================================
 * HIMANSHU MATLOTIA PORTFOLIO — HOME PAGE LOGIC
 * Features:
 *  - Dynamic Selected Work generation from single array
 *  - Companies worked with generation
 *  - About Me section generation
 *  - Interactive hanging cat: 2-frame swap, sway, meow audio on click
 *  - GSAP Hero entrance & ScrollTrigger section reveals
 *  - Clean straighten-on-hover CSS transition on phone mockups
 * ============================================================
 */

(function () {
  'use strict';

  // ------------------------------------------------------------
  // 1. SELECTED WORK DATA ARRAY (Single Source of Truth)
  // ------------------------------------------------------------
  // Add a project object here to automatically generate a new card.
  const projectsData = [
    {
      id: "01",
      title: "What if you never had to ask a friend to pay you back?",
      tagline: "Paytm Group Wallet — Eliminating Repayment Anxiety",
      description: "A design exploration into the hidden anxiety of shared expenses and why tracking was never the real problem. Reimagined group payments from awkward post-trip settlements to an upfront, pooled Group Wallet inside Paytm.",
      thumbnail: "assets/case-study-paytm/paytm-phone-mockup.png",
      thumbnailAlt: "Paytm Group Wallet Mobile App UI Mockup",
      tags: ["Fintech UX", "Behavioral Design", "UPI Payments", "Product Strategy"],
      link: "work/paytm-group-wallet.html",
      tiltClass: "phone-mockup-frame--tilt-left"
    },
    {
      id: "02",
      title: "Recruit CRM Company Page Redesign",
      tagline: "B2B SaaS Redesign — Workflow Hierarchy & Usability",
      description: "Redesigned the core Company Page in Recruit CRM to eliminate visual clutter, establish clear action hierarchy, and empower recruiters to manage jobs, tasks, and candidates faster.",
      thumbnail: "assets/case-study-recruit-crm/recruit-crm-mockup.png",
      thumbnailAlt: "Recruit CRM Company Page Redesign UI Mockup",
      tags: ["B2B SaaS", "UX Redesign", "Recruitment Tech", "Workflow Optimization"],
      link: "work/recruit-crm.html",
      tiltClass: "phone-mockup-frame--tilt-right"
    }
  ];

  /**
   * Render Selected Work Section from projectsData array
   */
  function renderProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    container.innerHTML = projectsData.map((project, index) => {
      const isReversed = index % 2 === 1 ? 'project-item--reversed' : '';
      const tagsMarkup = project.tags.map(tag => `<span class="tag-chip">${tag}</span>`).join('');

      return `
        <article class="project-item ${isReversed}" data-project="${project.id}">
          <div class="project-item__info">
            <span class="project-item__number">#${project.id}</span>
            <h2 class="project-item__title">${project.title}</h2>
            <p class="project-item__desc">${project.description}</p>
            <div class="project-item__tags">
              ${tagsMarkup}
            </div>
            <a href="${project.link}" class="btn-pill-lime" aria-label="View project ${project.title}">
              <span>VIEW PROJECT</span>
            </a>
          </div>

          <div class="project-item__visual">
            <div class="phone-mockup-frame ${project.tiltClass}">
              <img src="${project.thumbnail}" alt="${project.thumbnailAlt}" loading="lazy" width="280" height="500" />
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  /**
   * Render Companies Worked With Section
   */
  function renderCompanies() {
    const container = document.getElementById('companies-container');
    if (!container) return;

    container.innerHTML = `
      <h3 class="companies-title">Companies I've worked with</h3>
      <div class="companies-list">
        <!-- Company 1: Tabernacle Technologies -->
        <div class="company-badge" title="Tabernacle Technologies">
          <div class="company-badge__icon">
            <img src="assets/tabernacle-logo.png" alt="Tabernacle Technologies Logo" width="56" height="56" />
          </div>
          <span>Tabernacle Technologies</span>
        </div>

        <!-- Company 2: DIVINE LAB, IIT Delhi -->
        <div class="company-badge" title="DIVINE LAB, IIT Delhi">
          <div class="company-badge__icon">
            <img src="assets/divine-lab-logo.png" alt="DIVINE LAB, IIT Delhi Logo" width="64" height="44" />
          </div>
          <span>DIVINE LAB , IIT Delhi</span>
        </div>
      </div>
    `;
  }

  /**
   * Render About Me Section
   */
  function renderAbout() {
    const container = document.getElementById('about-container');
    if (!container) return;

    container.innerHTML = `
      <div class="about-content">
        <h2 class="about-heading">UX/UI Designer with a passion for conversion &amp; playfulness.</h2>
        <p class="about-bio">
          Hey! I'm <strong>Himanshu Matlotia</strong>, a product &amp; UX/UI designer crafting high-impact digital experiences. 
          I bridge user empathy with rigorous business metrics—turning complex checkout funnels, delivery logistics, 
          and enterprise workflows into simple, delightful mobile and web apps.
        </p>
        <div class="about-tags">
          <span class="tag-chip">Mobile App UX</span>
          <span class="tag-chip">AOV Optimization</span>
          <span class="tag-chip">Design Systems</span>
          <span class="tag-chip">Figma to Code</span>
        </div>
      </div>

      <div class="about-photo-wrapper">
        <div class="scallop-avatar">
          <img src="assets/himanshu-avatar-clean.png" alt="Himanshu Matlotia portrait with purple scalloped frame" width="220" height="260" loading="lazy" />
        </div>
      </div>
    `;
  }



  /**
   * Interactive Hanging Black Cat
   * - 2-Frame swapping on hover (hanging-cat-1.png <-> hanging-cat-2.png)
   * - Pendulum sway animation on hover
   * - Audio playback on click (meow.mp3) + pop-up speech bubble + bounce
   */
  function initHangingCat() {
    const catContainer = document.getElementById('hero-hanging-cat');
    const catImg = document.getElementById('hanging-cat-img');
    if (!catContainer || !catImg) return;

    // Preload audio
    const meowAudio = new Audio('assets/meow.mp3');
    meowAudio.preload = 'auto';

    // Create meow speech bubble element
    let bubble = document.querySelector('.cat-meow-bubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'cat-meow-bubble';
      bubble.textContent = 'Meow! 🐾';
      catContainer.appendChild(bubble);
    }

    let swayTween = null;

    // Hover: Swap to Frame 2 & Sway
    catContainer.addEventListener('mouseenter', () => {
      catImg.src = 'assets/hanging-cat-2.png';

      if (typeof gsap !== 'undefined') {
        swayTween = gsap.to(catContainer, {
          rotation: 8,
          duration: 0.35,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });
      }
    });

    // Leave: Swap back to Frame 1 & Reset
    catContainer.addEventListener('mouseleave', () => {
      catImg.src = 'assets/hanging-cat-1.png';

      if (swayTween) {
        swayTween.kill();
      }
      if (typeof gsap !== 'undefined') {
        gsap.to(catContainer, {
          rotation: 0,
          duration: 0.4,
          ease: 'elastic.out(1, 0.4)'
        });
      }
    });

    // Click: Play Meow Sound + Speech Bubble + Bounce
    catContainer.addEventListener('click', () => {
      try {
        meowAudio.currentTime = 0;
        const playPromise = meowAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => console.log('Audio autoplay prevented:', err));
        }
      } catch (err) {
        console.warn('Audio play error:', err);
      }

      bubble.classList.add('show');
      setTimeout(() => {
        bubble.classList.remove('show');
      }, 1400);

      if (typeof gsap !== 'undefined') {
        gsap.timeline()
          .to(catContainer, { scale: 1.15, rotation: -12, duration: 0.12, ease: 'power2.out' })
          .to(catContainer, { scale: 1.08, rotation: 10, duration: 0.12, ease: 'power2.inOut' })
          .to(catContainer, { scale: 1, rotation: 0, duration: 0.3, ease: 'elastic.out(1.2, 0.5)' });
      }
    });

    // Interaction for Sitting White Cat on DESIGNER badge
    const sittingCat = document.getElementById('sitting-badge-cat');
    const designerTag = document.getElementById('hero-designer-tag');
    if (sittingCat && designerTag) {
      sittingCat.addEventListener('click', (e) => {
        e.stopPropagation();
        try {
          meowAudio.currentTime = 0;
          meowAudio.play().catch(() => {});
        } catch (_) {}

        if (typeof gsap !== 'undefined') {
          gsap.timeline()
            .to(sittingCat, { scale: 1.3, y: -6, duration: 0.12, ease: 'back.out(2)' })
            .to(designerTag, { rotation: -6.5, duration: 0.15, ease: 'power2.out' }, 0)
            .to(sittingCat, { scale: 1, y: 0, duration: 0.3, ease: 'elastic.out(1.2, 0.5)' })
            .to(designerTag, { rotation: -3.5, duration: 0.35, ease: 'elastic.out(1, 0.5)' });
        }
      });
    }
  }

  /**
   * GSAP Scroll Reveals for Sections
   */
  function initScrollReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Reveal project items
    gsap.utils.toArray('.project-item').forEach(item => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out'
      });
    });

    // Reveal companies section
    gsap.from('.companies-section', {
      scrollTrigger: {
        trigger: '.companies-section',
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });

    // Reveal about section
    gsap.from('.about-grid', {
      scrollTrigger: {
        trigger: '.about-section',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: 45,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out'
    });
  }

  /**
   * Hero Page Load Entrance Animation (GSAP)
   */
  function initHeroAnimation() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Smooth subtle entrance without setting initial opacity to 0
    gsap.from('.hero-badge-wrapper', {
      y: 15,
      duration: 0.6,
      ease: 'power2.out',
      clearProps: 'all'
    });

    gsap.from('.hero-title', {
      y: 20,
      duration: 0.7,
      ease: 'power2.out',
      clearProps: 'all'
    });

    gsap.from('.hero-hanging-cat', {
      y: -30,
      rotation: -12,
      duration: 0.8,
      ease: 'back.out(1.8)',
      clearProps: 'all'
    });
  }

  /**
   * Interactive White Dots Cursor Spotlight on Blue Hero Card
   * As the cursor moves inside the card, the white dots immediately around
   * the cursor illuminate and brighten with a smooth radial falloff.
   */
  function initHeroCardDotsInteraction() {
    const card = document.querySelector('.hero-card');
    if (!card) return;

    let rafId = null;
    let targetX = -999;
    let targetY = -999;

    function updateCoordinates() {
      card.style.setProperty('--mouse-x', `${targetX}px`);
      card.style.setProperty('--mouse-y', `${targetY}px`);
      rafId = null;
    }

    card.addEventListener('pointerenter', (e) => {
      const rect = card.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      card.style.setProperty('--dot-glow-opacity', '1');
      updateCoordinates();
    });

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;

      if (!rafId) {
        rafId = requestAnimationFrame(updateCoordinates);
      }
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--dot-glow-opacity', '0');
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }

  // ------------------------------------------------------------
  // INITIALIZATION ON DOM READY
  // ------------------------------------------------------------
  function init() {
    renderProjects();
    renderCompanies();
    renderAbout();
    initHangingCat();
    initHeroCardDotsInteraction();
    initHeroAnimation();
    initScrollReveals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export data to window for easy expansion
  window.portfolioProjects = projectsData;

})();
