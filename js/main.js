/**
 * ============================================================
 * HIMANSHU MATLOTIA PORTFOLIO — MAIN SHARED JAVASCRIPT
 * Handles: Shared Footer Injection, Smooth Scrolling
 * ============================================================
 */

(function () {
  'use strict';

  /**
   * Determine relative path prefix depending on whether the page is at root or in a subfolder like /work/
   */
  const isSubfolder = window.location.pathname.includes('/work/') || window.location.pathname.endsWith('/work');
  const pathPrefix = isSubfolder ? '../' : '';

  // 1. SHARED FOOTER TEMPLATE (Single source of truth across all pages)
  const sharedFooterMarkup = `
    <footer class="site-footer" id="contact" role="contentinfo">
      <div class="site-container">
        
        <!-- Top 3 Action Cards (Resume, LinkedIn, Mail) matching user reference -->
        <div class="footer-actions-container">
          <div class="footer-actions-grid">
            
            <!-- RESUME -->
            <a href="https://drive.google.com/file/d/1Zidk40xp9YBlxyGMCen4q8tyqnFkjrZ0/view?usp=sharing" class="footer-action-item" target="_blank" rel="noopener noreferrer" aria-label="View / Download Resume (Google Drive)">
              <div class="footer-action-content">
                <span class="footer-action-title">RESUME</span>
                <span class="footer-action-subtitle">Download the PDF</span>
              </div>
              <div class="footer-action-circle" aria-hidden="true">
                <svg class="footer-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </div>
            </a>

            <!-- LINKEDIN -->
            <a href="https://www.linkedin.com/in/himanshumatlotia" class="footer-action-item" target="_blank" rel="noopener noreferrer" aria-label="Connect on LinkedIn">
              <div class="footer-action-content">
                <span class="footer-action-title">LINKEDIN</span>
                <span class="footer-action-subtitle">Say hi, Connect</span>
              </div>
              <div class="footer-action-circle" aria-hidden="true">
                <svg class="footer-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </div>
            </a>

            <!-- MAIL (Click to Copy himanshumatlotia@gmail.com) -->
            <button type="button" class="footer-action-item footer-action-item--copy" id="footer-copy-email-btn" aria-label="Copy email address: himanshumatlotia@gmail.com" title="Click to copy himanshumatlotia@gmail.com">
              <div class="footer-action-content">
                <span class="footer-action-title">MAIL</span>
                <span class="footer-action-subtitle" id="mail-subtitle-text">Write to me directly</span>
              </div>
              <div class="footer-action-circle" aria-hidden="true">
                <!-- Default Copy Icon -->
                <svg class="copy-default-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <!-- Success Checkmark Icon -->
                <svg class="copy-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span class="copy-toast-badge" id="copy-toast-badge">Copied!</span>
            </button>

          </div>
        </div>

        <!-- Giant Neon Lime Bottom Headline (Left aligned matching Figma) -->
        <div class="footer-big-name" aria-hidden="true">
          HIMANSHU MATLOTIA
        </div>

      </div>
    </footer>
  `;

  /**
   * Inject shared footer if #shared-footer container is present
   */
  function injectSharedFooter() {
    const footerContainer = document.getElementById('shared-footer');
    if (footerContainer && !footerContainer.hasChildNodes()) {
      footerContainer.outerHTML = sharedFooterMarkup;
    }
  }

  /**
   * Smooth Anchor Scrolling
   */
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  /**
   * Scroll to Top Button on bottom right
   * - Appears when scrolled down > 240px
   * - Scrolls smoothly to top of website on tap/click
   */
  function initScrollToTop() {
    let btn = document.getElementById('scroll-to-top-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'scroll-to-top-btn';
      btn.className = 'scroll-to-top-btn';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.setAttribute('title', 'Back to top');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      document.body.appendChild(btn);
    }

    // Toggle visibility based on scroll depth
    const onScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > 240) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // On click/tap: scroll smoothly to top
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /**
   * Footer Copy Email Functionality
   * - Copies himanshumatlotia@gmail.com
   * - Shows visual feedback: replaces icon with checkmark, transforms button, updates subtitle
   */
  function initFooterCopy() {
    const copyBtn = document.getElementById('footer-copy-email-btn');
    const subtitle = document.getElementById('mail-subtitle-text');
    if (!copyBtn) return;

    const email = 'himanshumatlotia@gmail.com';
    let timer = null;

    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const showSuccess = () => {
        copyBtn.classList.add('is-copied');
        if (subtitle) {
          subtitle.textContent = 'Copied to clipboard! ✓';
        }

        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          copyBtn.classList.remove('is-copied');
          if (subtitle) {
            subtitle.textContent = 'Write to me directly';
          }
        }, 2400);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(showSuccess).catch(() => {
          fallbackCopy(email, showSuccess);
        });
      } else {
        fallbackCopy(email, showSuccess);
      }
    });

    function fallbackCopy(text, callback) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        callback();
      } catch (err) {
        console.error('Copy failed:', err);
      } finally {
        if (document.body.contains(textarea)) {
          document.body.removeChild(textarea);
        }
      }
    }
  }

  // Execute on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectSharedFooter();
      initFooterCopy();
      initSmoothScroll();
      initScrollToTop();
    });
  } else {
    injectSharedFooter();
    initFooterCopy();
    initSmoothScroll();
    initScrollToTop();
  }

})();
