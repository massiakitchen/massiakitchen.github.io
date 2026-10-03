// ==============================
// Enhanced Website Functionality with Performance Improvements
// ==============================

// Helper: safe querySelector with error handling
export const $ = (sel, ctx = document) => {
  try {
    return ctx.querySelector(sel);
  } catch (error) {
    console.warn('Query selector error:', error);
    return null;
  }
};

export const $$ = (sel, ctx = document) => {
  try {
    return Array.from(ctx.querySelectorAll(sel));
  } catch (error) {
    console.warn('Query selector all error:', error);
    return [];
  }
};

// Performance optimizations
const perf = {
  lastScroll: 0,
  scrollTimeout: null,
  resizeTimeout: null
};

// App state management
export const appState = {
  soundEnabled: true,
  theme: localStorage.getItem('theme') || 'dark',
  currentReview: 0,
  reviewInterval: null,
  pageLoadTime: Date.now(),
  calculatorData: {
    area: 12,
    material: 'standard',
    drawers: 12,
    addons: [],
    appliances: [],
    length: 4,
    width: 3,
    wallCabinets: 4,
    baseCabinets: 6
  }
};

// Timer management
const timers = {
  reviewInterval: null,
  logoPulse: null,
  headingGlow: null,
  countdown: null
};

// Debounce function for performance
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for performance
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Normalize an Egyptian phone number: strip spaces/dashes and unify the
// country prefix (0... -> +20..., 20... -> +20..., 0020... -> +20...).
// The local 01XXXXXXXXX form is preserved as-is so both forms stay valid.
export function normalizeEgyptPhone(phone) {
  if (typeof phone !== 'string') return '';
  let value = phone.replace(/[\s-]/g, '');
  if (/^0020(?=1)/.test(value)) {
    value = '+20' + value.slice(4);
  } else if (/^0(?=1)/.test(value)) {
    value = '+20' + value.slice(1);
  } else if (/^20(?=1)/.test(value)) {
    value = '+' + value;
  }
  return value;
}

// Single shared Egyptian mobile validator. Accepts 01XXXXXXXXX and
// +201XXXXXXXXX (after removing spaces/dashes).
export function isValidEgyptPhone(phone) {
  if (typeof phone !== 'string') return false;
  return /^(?:\+20|0)1[0125][0-9]{8}$/.test(normalizeEgyptPhone(phone));
}

// Accessibility: honor prefers-reduced-motion
export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}


// Show notification function
export function showNotification(message, type = 'info', duration = 5000) {
  // Remove existing notifications
  const existingNotification = $('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
        <i data-lucide="x"></i>
      </button>
    </div>
  `;

  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
    color: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 400px;
    animation: slideIn 0.3s ease;
  `;

  // Add animation styles if not already present
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-right: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto remove after `duration` ms (default 5 seconds)
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, duration);
}

// Ripple effect for buttons
function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add('ripple');

  const ripple = button.getElementsByClassName('ripple')[0];
  if (ripple) {
    ripple.remove();
  }

  button.appendChild(circle);
}

// Format number to Arabic format
export function formatNumber(number) {
  return new Intl.NumberFormat('ar-EG').format(number);
}

// Analytics tracking function
export function trackEvent(category, action, label) {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
  }

  // Custom tracking
  console.log(`Event: ${category} - ${action} - ${label}`);
}

// Enhanced Theme Toggle with Logo Switching
function initThemeToggle() {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle');
  const logoLight = $('.logo-light');
  const logoDark = $('.logo-dark');

  // Apply saved theme
  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
      themeToggleBtns.forEach(btn => {
        btn.innerHTML = '<i data-lucide="moon" class="premium-icon"></i>';
      });
      if (logoLight && logoDark) {
        logoLight.style.display = 'none';
        logoDark.style.display = 'block';
      }
    } else {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      themeToggleBtns.forEach(btn => {
        btn.innerHTML = '<i data-lucide="sun" class="premium-icon"></i>';
      });
      if (logoLight && logoDark) {
        logoLight.style.display = 'block';
        logoDark.style.display = 'none';
      }
    }
    // Re-initialize Lucide icons for the new innerHTML
    if (window.lucide) lucide.createIcons();

    appState.theme = theme;
    localStorage.setItem('theme', theme);

    // Track theme change
    trackEvent('preferences', 'theme_toggle', theme);
  }

  // Initialize theme
  applyTheme(appState.theme);

  // Toggle theme on click
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const newTheme = appState.theme === 'dark' ? 'light' : 'dark';
      this.classList.add('gold-flash');
      setTimeout(() => {
        this.classList.remove('gold-flash');
        applyTheme(newTheme);
      }, 300);
    });
  });
}
// Mobile Menu Toggle
function initMobileMenu() {
  const mobileMenuBtn = $('.mobile-menu-btn');
  const mobileMenu = $('#mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('active');

      // Prevent body scroll when menu is open
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    // Close mobile menu when clicking on links
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        mobileMenuBtn.focus(); // Return focus to button
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        mobileMenuBtn.focus();
      }
    });
  }
}

// Scroll reveal with Intersection Observer
function initRevealAnimations() {
  const autoRevealElements = $$('section, .card, .hero, footer');
  autoRevealElements.forEach(el => {
    // Skip materials section to prevent gap after scrolly hero
    if (el.classList.contains('materials-prices') || el.id === 'materials') {
      el.classList.add('active'); // Ensure it's active immediately
      return;
    }
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
  });

  const reveals = $$('.reveal');

  // Use Intersection Observer for better performance
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));
}

// Header shrink on scroll with throttle
function initHeaderScroll() {
  const header = $('header.site-header');
  const headerScrollHandler = throttle(() => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, 50);

  window.addEventListener('scroll', headerScrollHandler);
}

// WhatsApp FAB behavior
function initWhatsAppFAB() {
  const whatsappWrapper = $('.whatsapp-wrapper');
  const whatsappBtn = $('.whatsapp-fab');

  if (whatsappBtn) {
    const fabScrollHandler = throttle(() => {
      const current = window.pageYOffset;

      if (current > perf.lastScroll && current > 200) {
        // Scrolling down - hide
        whatsappWrapper.style.opacity = '0';
        whatsappWrapper.style.transform = 'translateY(40px)';
        whatsappWrapper.style.pointerEvents = 'none';
      } else {
        // Scrolling up - show
        whatsappWrapper.style.opacity = '1';
        whatsappWrapper.style.transform = 'translateY(0)';
        whatsappWrapper.style.pointerEvents = 'auto';
      }

      perf.lastScroll = current;
    }, 100);

    window.addEventListener('scroll', fabScrollHandler);

    // Track WhatsApp clicks
    whatsappBtn.addEventListener('click', () => {
      trackEvent('engagement', 'whatsapp_click', 'floating_button');
    });
  }
}

// Button pulse animation
function initButtonAnimations() {
  const primaryButtons = $$('.btn-primary, .cta-header');

  // Add ripple effect to all buttons using event delegation
  document.addEventListener('click', function (e) {
    if (e.target.matches('.btn, .btn-primary, .btn-ghost, .cta-header')) {
      createRipple(e);
    }
  });

  // Buttons pulse every 6s
  setInterval(() => {
    primaryButtons.forEach(btn => {
      btn.classList.add('pulsing');
      setTimeout(() => btn.classList.remove('pulsing'), 1000);
    });
  }, 6000);

  // Initial animations
  setTimeout(() => {
    primaryButtons.forEach(b => b.classList.add('pulsing'));
    setTimeout(() => primaryButtons.forEach(b => b.classList.remove('pulsing')), 900);
  }, 1600);
}

// Lightbox functionality
function initLightbox() {
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');

  // Event delegation for gallery images
  document.addEventListener('click', function (e) {
    if (e.target.matches('.gallery-grid .card img')) {
      // Skip if this is a gallery item (uses new modal system)
      if (e.target.closest('.gallery-item')) {
        return;
      }
      e.target.style.cursor = 'zoom-in';
      openLightbox(e.target);
    }
  });

  window.openLightbox = function (imgEl) {
    if (!lightbox || !lightboxImg) return;

    // Store focused element to return to
    window.lastFocusedElement = document.activeElement;

    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt || 'صورة المعرض';
    lightbox.classList.add('visible');
    lightbox.setAttribute('aria-hidden', 'false');

    // Prevent background scroll
    document.body.style.overflow = 'hidden';

    // Focus close button
    const closeBtn = lightbox.querySelector('.close-lightbox');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 100);

    trackEvent('gallery', 'lightbox_open', imgEl.alt);
  }

  window.closeLightbox = function () {
    if (!lightbox || !lightboxImg) return;

    lightbox.classList.remove('visible');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';

    // Restore scroll
    document.body.style.overflow = '';

    // Return focus
    if (window.lastFocusedElement) {
      window.lastFocusedElement.focus();
    }
  };

  // Close lightbox with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('visible')) {
      closeLightbox();
    }
  });

  const closeBtn = $('.close-lightbox');
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
}


// Reviews slider functionality
function initReviewsSlider() {
  const reviewCards = $$('.review-card');
  const indicators = $$('.indicator');

  function showReview(index) {
    // Hide all reviews
    reviewCards.forEach(card => {
      card.classList.remove('active');
      card.style.display = 'none';
    });

    // Remove active class from all indicators
    indicators.forEach(indicator => {
      indicator.classList.remove('active');
    });

    // Show selected review
    reviewCards[index].classList.add('active');
    reviewCards[index].style.display = 'block';

    // Activate corresponding indicator
    if (indicators[index]) {
      indicators[index].classList.add('active');
    }

    appState.currentReview = index;
  }

  function stopReviewAutoAdvance() {
    if (timers.reviewInterval) {
      clearInterval(timers.reviewInterval);
      timers.reviewInterval = null;
    }
  }

  function startReviewAutoAdvance() {
    // Respect users who prefer reduced motion: no auto-advance.
    if (prefersReducedMotion()) return;
    if (reviewCards.length < 2) return;
    stopReviewAutoAdvance();
    timers.reviewInterval = setInterval(() => {
      const nextReview = (appState.currentReview + 1) % reviewCards.length;
      showReview(nextReview);
    }, 5000);
  }

  // Initialize reviews slider
  if (reviewCards.length > 0) {
    showReview(0);

    // Auto-advance reviews every 5 seconds (skipped for prefers-reduced-motion)
    startReviewAutoAdvance();
  }

  // Pause auto-advance while the user hovers or focuses the carousel
  const reviewsSlider = $('.reviews-slider');
  if (reviewsSlider) {
    reviewsSlider.addEventListener('mouseenter', stopReviewAutoAdvance);
    reviewsSlider.addEventListener('mouseleave', startReviewAutoAdvance);
    reviewsSlider.addEventListener('focusin', stopReviewAutoAdvance);
    reviewsSlider.addEventListener('focusout', startReviewAutoAdvance);
  }

  // Global Review Controls (Exposed for HTML onclick)
  window.nextReview = () => {
    const nextIdx = (appState.currentReview + 1) % reviewCards.length;
    showReview(nextIdx);
    stopReviewAutoAdvance();
    startReviewAutoAdvance();
  };

  window.prevReview = () => {
    const prevIdx = (appState.currentReview - 1 + reviewCards.length) % reviewCards.length;
    showReview(prevIdx);
    stopReviewAutoAdvance();
    startReviewAutoAdvance();
  };

  // Event delegation for review indicators
  document.addEventListener('click', function (e) {
    if (e.target.matches('.indicator')) {
      const index = parseInt(e.target.getAttribute('data-slide'));

      // Reset interval when user manually changes slide
      stopReviewAutoAdvance();
      showReview(index);

      // Restart auto-advance
      startReviewAutoAdvance();
    }
  });
}

// Branch map toggle functionality
function initBranchMaps() {
  const mapToggleBtns = $$('.btn-map-toggle');

  // Event delegation for map toggles
  document.addEventListener('click', function (e) {
    if (e.target.matches('.btn-map-toggle')) {
      const branch = e.target.getAttribute('data-branch');
      const map = $(`#map-${branch}`);
      const isVisible = map.style.display === 'block';

      // Hide all maps first
      $$('.branch-map').forEach(m => {
        m.style.display = 'none';
      });

      // Reset all buttons
      $$('.btn-map-toggle').forEach(b => {
        b.textContent = 'عرض الخريطة';
      });

      // Toggle current map
      if (!isVisible) {
        map.style.display = 'block';
        e.target.textContent = 'إخفاء الخريطة';

        // Smooth scroll to map
        map.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        trackEvent('branches', 'map_view', branch);
      }
    }
  });
}

// Booking system functionality
function initBookingSystem() {
  const bookingForm = $('.booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = this.querySelector('input[type="text"]')?.value || '';
      let phone = this.querySelector('input[type="tel"]')?.value || '';
      const date = this.querySelector('input[type="date"]')?.value || '';

      if (!name || !phone) {
        showPremiumModal({
          title: 'بيانات ناقصة',
          message: 'الرجاء إدخال الاسم ورقم الهاتف لنتمكن من التواصل معك.',
          icon: 'error'
        });
        return;
      }

      // Egyptian Phone Validation (shared: accepts 01XXXXXXXXX and +201XXXXXXXXX)
      if (!isValidEgyptPhone(phone)) {
        showPremiumModal({
          title: 'رقم خطأ',
          message: 'الرجاء إدخال رقم هاتف مصري صحيح (مثال: 010xxxxxxxx).',
          icon: 'error'
        });
        return;
      }

      phone = normalizeEgyptPhone(phone);

      let message = `حجز استشارة مجانية:\nالاسم: ${name}\nالهاتف: ${phone}`;
      if (date) message += `\nالتاريخ المفضل: ${date}`;
      const whatsappUrl = `https://wa.me/201092497811?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      this.reset();
      showPremiumModal({
        title: 'تم الإرسال بنجاح',
        message: 'تم إرسال طلب الحجز بنجاح! سيتم التواصل معك عبر واتساب لتأكيد الموعد.',
        icon: 'success'
      });

      trackEvent('booking', 'consultation_request', 'free_consultation');
    });
  }
}



// Run main DOM ready
document.addEventListener('DOMContentLoaded', function () {

  // --- Year in footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Real Asset Preloader
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const preloader = document.getElementById('preloader');
  const slowNetworkMsg = document.getElementById('slowNetworkMsg');

  // Asset tracking (above-the-fold only: exclude lazy images)
  const images = Array.from(document.images).filter(img => img.getAttribute('loading') !== 'lazy');
  const totalAssets = images.length + 1; // +1 for fonts
  let loadedAssets = 0;
  let currentProgress = 0;
  let finished = false;
  let hardCapTimer = null;

  function updateProgress() {
    loadedAssets++;
    const targetProgress = Math.min(100, Math.round((loadedAssets / totalAssets) * 100));

    // Smooth transition for progress bar
    const animateDuration = 500;
    const startTime = performance.now();
    const startProgress = currentProgress;

    function step(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animateDuration, 1);
      currentProgress = startProgress + (targetProgress - startProgress) * progress;

      if (progressBar) progressBar.style.width = `${currentProgress}%`;
      if (progressText) progressText.textContent = `${Math.round(currentProgress)}%`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else if (currentProgress >= 100) {
        finishLoading();
      }
    }
    requestAnimationFrame(step);
  }

  function finishLoading() {
    if (finished) return;
    finished = true;
    if (hardCapTimer) clearTimeout(hardCapTimer);
    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('hidden');
        document.body.classList.add('loaded');
        setTimeout(() => preloader.remove(), 600);
      }
    }, 400);
  }

  // Hard cap: always finish within 2500 ms even if assets hang
  hardCapTimer = setTimeout(finishLoading, 2500);

  // Slow Network fallback
  const networkTimer = setTimeout(() => {
    if (currentProgress < 80 && slowNetworkMsg) {
      slowNetworkMsg.classList.remove('hidden');
      slowNetworkMsg.style.display = 'flex';
    }
  }, 6000);

  // Track Images
  if (images.length > 0) {
    images.forEach(img => {
      if (img.complete) {
        updateProgress();
      } else {
        img.addEventListener('load', updateProgress);
        img.addEventListener('error', updateProgress); // Count errors too to avoid hanging
      }
    });
  } else {
    updateProgress(); // If no images
  }

  // Track Fonts
  if (document.fonts) {
    document.fonts.ready.then(() => {
      updateProgress();
    });
  } else {
    updateProgress();
  }

  window.addEventListener('load', function () {
    console.log('Page assets loaded');
    const loadTime = Date.now() - appState.pageLoadTime;
    console.log(`Page loaded in ${loadTime}ms`);
    // Safety check: force finish if window load fires but preloader is still there
    if (currentProgress < 100) {
      loadedAssets = totalAssets;
      updateProgress();
    }
  });

  // Initialize all components
  initComponents();

  // Track time spent on page
  window.addEventListener('beforeunload', () => {
    const timeSpent = Date.now() - appState.pageLoadTime;
    trackEvent('engagement', 'time_spent', Math.round(timeSpent / 1000) + 's');
  });

  // --- Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    Object.values(timers).forEach(timer => {
      if (timer) clearInterval(timer);
    });
  });

}); // DOMContentLoaded end

//

// ==============================
// Enhanced Materials Detail Functionality
// ==============================









// ==============================
// Gallery Functionality
// ==============================

// Gallery filtering function
function filterGallery(filter) {
  const items = $$('.gallery-grid .item');
  const loadMoreBtn = $('#loadMoreBtn');
  const loadMoreContainer = $('#loadMoreContainer');

  items.forEach(it => {
    it.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    const isHidden = it.classList.contains('gallery-item-hidden');
    const matchesFilter = filter === 'all' || it.classList.contains(filter);

    if (matchesFilter) {
      // Show only if not hidden
      if (!isHidden) {
        it.style.display = 'block';
        requestAnimationFrame(() => {
          it.style.opacity = '1';
          it.style.transform = 'scale(1)';
        });
      }
    } else {
      it.style.opacity = '0';
      it.style.transform = 'scale(0.95)';
      setTimeout(() => it.style.display = 'none', 300);
    }
  });

  // Check if there are hidden items for current filter
  const hiddenItems = $$('.gallery-grid .item.gallery-item-hidden');
  const hasHiddenInFilter = Array.from(hiddenItems).some(item => {
    return filter === 'all' || item.classList.contains(filter);
  });

  // Reset load more button
  if (loadMoreBtn) {
    if (hasHiddenInFilter) {
      loadMoreBtn.innerHTML = `
        <i data-lucide="plus-circle" class="premium-icon sm" style="margin-inline-end: 0.5rem;"></i>
        عرض المزيد
      `;
      loadMoreBtn.disabled = false;
      loadMoreBtn.style.opacity = '1';
      loadMoreBtn.style.cursor = 'pointer';

      // Re-init lucide icons
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    } else {
      loadMoreBtn.innerHTML = `
        <i data-lucide="check-circle" class="premium-icon sm" style="margin-inline-end: 0.5rem;"></i>
        تم عرض كل الأعمال
      `;
      loadMoreBtn.disabled = true;
      loadMoreBtn.style.opacity = '0.6';
      loadMoreBtn.style.cursor = 'not-allowed';

      // Re-init lucide icons
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }
}

// Gallery filters (immediate filtering with a short CSS transition only)
function initGallery() {
  const filterBtns = $$('.filter-btn');
  const skeletonGrid = $('#skeletonGrid');
  const galleryGrid = $('#galleryGrid');

  // Show gallery immediately (items are in the DOM with native lazy-loading)
  if (skeletonGrid) skeletonGrid.style.display = 'none';
  if (galleryGrid) galleryGrid.style.display = 'grid';

  // Event delegation for filter buttons
  document.addEventListener('click', function (e) {
    if (e.target.matches('.filter-btn')) {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');

      // Filter immediately; filterGallery animates via CSS transition
      filterGallery(filter);

      trackEvent('gallery', 'filter', filter);
    }
  });
}

// Load More Gallery Items Function
let itemsToShow = 3; // Initial items visible
const itemsPerLoad = 3; // Items to show per click

function loadMoreGalleryItems() {
  const allItems = $$('.gallery-grid .item');
  const hiddenItems = $$('.gallery-grid .item.gallery-item-hidden');
  const loadMoreBtn = $('#loadMoreBtn');
  const loadMoreContainer = $('#loadMoreContainer');
  const currentFilter = $('.filter-btn.active')?.getAttribute('data-filter') || 'all';

  // Get hidden items that match current filter
  const filteredHiddenItems = Array.from(hiddenItems).filter(item => {
    if (currentFilter === 'all') return true;
    return item.classList.contains(currentFilter);
  });

  if (filteredHiddenItems.length === 0) {
    if (loadMoreBtn) {
      loadMoreBtn.textContent = 'لا توجد أعمال أخرى';
      loadMoreBtn.disabled = true;
    }
    return;
  }

  // Show next batch of items
  const itemsToReveal = filteredHiddenItems.slice(0, itemsPerLoad);

  itemsToReveal.forEach((item, index) => {
    setTimeout(() => {
      item.classList.remove('gallery-item-hidden');
      item.style.opacity = '0';
      item.style.transform = 'scale(0.9)';

      requestAnimationFrame(() => {
        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      });
    }, index * 100);
  });

  // Update button state
  setTimeout(() => {
    const remainingHidden = $$('.gallery-grid .item.gallery-item-hidden');
    const remainingFiltered = Array.from(remainingHidden).filter(item => {
      if (currentFilter === 'all') return true;
      return item.classList.contains(currentFilter);
    });

    if (remainingFiltered.length === 0) {
      if (loadMoreBtn) {
        loadMoreBtn.innerHTML = `
          <i data-lucide="check-circle" class="premium-icon sm" style="margin-inline-end: 0.5rem;"></i>
          تم عرض كل الأعمال
        `;
        loadMoreBtn.disabled = true;
        loadMoreBtn.style.opacity = '0.6';
        loadMoreBtn.style.cursor = 'not-allowed';

        // Re-init lucide icons
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }
    }
  }, itemsPerLoad * 100 + 100);

  trackEvent('gallery', 'load_more', currentFilter);
}


// ==============================
// Kitchen Tabs System (ClickUp Style)
// ==============================
function initKitchenTabs() {
  const tabBtns = $$('.cu-tab-btn');
  const tabContents = $$('.cu-tab-content');

  if (!tabBtns.length) return;

  function switchTab(targetId) {
    // Buttons
    tabBtns.forEach(btn => {
      if (btn.dataset.target === targetId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Content
    tabContents.forEach(content => {
      if (content.id === targetId) {
        // Use setTimeout to allow display:block to apply before opacity transition
        content.classList.add('active');
        content.style.display = 'grid';

        // Reset animations on children for replay effect
        const children = content.querySelectorAll('.price-item, .material-category');
        children.forEach(child => {
          child.style.animation = 'none';
          child.offsetHeight; /* Trigger reflow */
          child.style.animation = null;
        });

        requestAnimationFrame(() => {
          content.style.opacity = '1';
          content.style.transform = 'translateY(0)';
        });
      } else {
        content.style.opacity = '0';
        content.style.transform = 'translateY(20px)';
        setTimeout(() => {
          content.classList.remove('active');
          if (!content.classList.contains('active')) {
            content.style.display = 'none';
          }
        }, 300); // Wait for transition
      }
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default anchor behavior
      const target = btn.dataset.target;
      switchTab(target);
      trackEvent('ui', 'tab_switch', target);
    });
  });

  // Activate first tab by default ensuring styles are set
  if (tabBtns.length > 0) {
    // Force initial state
    const firstTarget = tabBtns[0].dataset.target;
    switchTab(firstTarget);
  }
}

// ==============================
// Enhanced FAQ Functionality
// ==============================

function initEnhancedFAQ() {
  const faqItems = $$('.faq-item');
  const categoryBtns = $$('.category-btn');
  const searchInput = $('#faqSearch');
  const searchResults = $('#searchResults');

  // FAQ Accordion
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', function () {
      const isActive = item.classList.contains('active');

      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current item
      item.classList.toggle('active', !isActive);

      // Update ARIA attributes
      const isExpanded = item.classList.contains('active');
      this.setAttribute('aria-expanded', isExpanded);

      // Track FAQ interaction
      if (!isActive) {
        const questionText = this.querySelector('.question-text').textContent;
        trackEvent('faq', 'question_open', questionText);
      }
    });
  });

  // Category Filtering
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const category = this.getAttribute('data-category');

      // Update active button
      categoryBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Filter FAQ items
      faqItems.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(10px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });

      trackEvent('faq', 'category_filter', category);
    });
  });

  // Search Functionality
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', function () {
      const searchTerm = this.value.toLowerCase().trim();

      if (searchTerm.length === 0) {
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        return;
      }

      const matchingItems = Array.from(faqItems).filter(item => {
        const questionText = item.querySelector('.question-text').textContent.toLowerCase();
        const answerText = item.querySelector('.answer-content').textContent.toLowerCase();
        return questionText.includes(searchTerm) || answerText.includes(searchTerm);
      });

      if (matchingItems.length > 0) {
        searchResults.innerHTML = matchingItems.map(item => {
          const question = item.querySelector('.question-text').textContent;
          return `
            <div class="search-result-item" data-item-id="${item.id || ''}">
              ${question}
            </div>
          `;
        }).join('');

        searchResults.classList.add('active');

        // Add click handlers to search results
        $$('.search-result-item').forEach(resultItem => {
          resultItem.addEventListener('click', function () {
            const itemId = this.getAttribute('data-item-id');
            const targetItem = itemId ? $(`#${itemId}`) : matchingItems[0];

            if (targetItem) {
              // Show all categories
              categoryBtns.forEach(b => {
                if (b.getAttribute('data-category') === 'all') {
                  b.click();
                }
              });

              // Scroll to and open the item
              targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetItem.classList.add('active');
              targetItem.querySelector('.faq-question').setAttribute('aria-expanded', 'true');

              // Highlight search term
              highlightSearchTerm(targetItem, searchTerm);
            }

            searchInput.value = '';
            searchResults.classList.remove('active');
          });
        });
      } else {
        searchResults.innerHTML = '<div class="no-results">لا توجد نتائج مطابقة</div>';
        searchResults.classList.add('active');
      }
    });

    // Close search results when clicking outside
    document.addEventListener('click', function (e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
      }
    });
  }
}

function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightSearchTerm(element, term) {
  if (!term) return;
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const nodes = [];
  let node;
  const lowerTerm = String(term).toLowerCase();
  while (node = walker.nextNode()) {
    if (node.textContent.toLowerCase().includes(lowerTerm)) {
      nodes.push(node);
    }
  }

  nodes.forEach(textNode => {
    const text = textNode.textContent;
    const regex = new RegExp(escapeRegExp(term), 'gi');
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    let found = false;

    while ((match = regex.exec(text)) !== null) {
      found = true;
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      const span = document.createElement('span');
      span.className = 'search-highlight';
      span.style.backgroundColor = 'rgba(212,175,55,0.3)';
      span.style.padding = '0.1rem 0.2rem';
      span.style.borderRadius = '3px';
      span.textContent = match[0];
      fragment.appendChild(span);
      lastIndex = match.index + match[0].length;
      if (match[0].length === 0) regex.lastIndex++;
    }

    if (!found) return;
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    textNode.parentNode.replaceChild(fragment, textNode);
  });
}

// Initialize all components
function initComponents() {
  initThemeToggle();
  initMobileMenu();
  initRevealAnimations();
  initHeaderScroll();
  initWhatsAppFAB();
  initButtonAnimations();
  initLightbox();
  initEnhancedFAQ(); // Replace initFAQ with this
  initReviewsSlider();
  initBranchMaps();
  initBookingSystem();
  initGallery(); // Added gallery initialization
  initKitchenTabs();
  initHero3DParallax();
  initFacebookSlider();
}

function initHero3DParallax() {
  // Skip mouse-driven parallax for users who prefer reduced motion.
  if (prefersReducedMotion()) return;

  const card = document.querySelector('.hero-glass-card');
  const floatingItems = document.querySelectorAll('.floating-item');

  if (!card) return;

  document.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    const xPos = (clientX / innerWidth) - 0.5;
    const yPos = (clientY / innerHeight) - 0.5;

    // 1. Central Card Tilt
    const rotateX = yPos * -15;
    const rotateY = xPos * 15;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

    // 2. Floating Items Parallax (Exclusively mouse-driven)
    floatingItems.forEach((item) => {
      const factor = parseFloat(item.dataset.parallaxFactor) || 20;
      const xMove = xPos * factor;
      const yMove = yPos * factor;

      const itemRotate = xPos * 5;
      item.style.transform = `translate3d(${xMove}px, ${yMove}px, 0) rotate(${itemRotate}deg)`;
    });
  });

  document.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    floatingItems.forEach(item => {
      item.style.transform = `translate3d(0, 0, 0) rotate(0deg)`;
    });
  });
}


// ==============================
// Gallery Modal Functionality
// ==============================

let currentGalleryData = null;
let currentImageIndex = 0;
let lastGalleryFocus = null;

// Keep Tab focus inside an open modal and return focus on close.
function trapTabKey(modal, e) {
  const focusable = modal.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  const visible = Array.from(focusable).filter(
    (el) => !el.disabled && el.getClientRects().length > 0
  );
  if (visible.length === 0) {
    e.preventDefault();
    return;
  }
  const first = visible[0];
  const last = visible[visible.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function focusModalClose(modal, selector) {
  const closeBtn = modal.querySelector(selector);
  if (closeBtn) closeBtn.focus();
}

// Open Gallery Modal
function openGalleryModal(galleryId, event) {
  // Prevent event bubbling to avoid triggering old lightbox
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const galleryCard = document.querySelector(`[data-gallery-id="${galleryId}"]`);
  if (!galleryCard) return;

  // Get data from card attributes (fall back to '' so the modal never shows "undefined")
  const title = galleryCard.dataset.title || '';
  const description = galleryCard.dataset.description || '';
  const price = galleryCard.dataset.price || '';
  // Parse images safely with fallback
  let images = [];
  try {
    images = JSON.parse(galleryCard.dataset.images || '[]');
  } catch (e) {
    console.warn('Error parsing gallery images:', e);
    // Fallback to minimal array if possible or empty
    images = [];
  }

  const video = galleryCard.dataset.video;

  // Store current gallery data
  currentGalleryData = {
    title,
    description,
    price,
    images,
    video
  };

  // Reset index
  currentImageIndex = 0;

  // Populate modal
  const modal = $('#galleryModal');
  if (!modal) return;

  // Set project info
  const modalTitle = $('#modalProjectTitle');
  const modalDesc = $('#modalProjectDescription');
  const modalPrice = $('#modalProjectPrice');

  if (modalTitle) modalTitle.textContent = title;
  if (modalDesc) modalDesc.textContent = description;
  if (modalPrice) modalPrice.textContent = price;

  // Build slider and thumbnails
  buildGallerySlider();
  buildGalleryThumbnails();

  // Show modal
  modal.classList.add('visible');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Move focus to the close button and remember where to restore it.
  lastGalleryFocus = document.activeElement;
  focusModalClose(modal, '.gallery-close');

  // Initialize Lucide icons for new elements
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  trackEvent('gallery', 'modal_open', galleryId);
}

// Close Gallery Modal
function closeGalleryModal() {
  const modal = $('#galleryModal');
  if (!modal) return;

  modal.classList.remove('visible');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Pause any playing videos
  const videos = $$('#modalSliderMain video');
  videos.forEach(v => v.pause());

  currentGalleryData = null;
  currentImageIndex = 0;

  // Restore focus to the element that opened the modal.
  if (lastGalleryFocus && document.contains(lastGalleryFocus)) {
    lastGalleryFocus.focus();
  }
  lastGalleryFocus = null;

  trackEvent('gallery', 'modal_close', '');
}

// Build Gallery Slider
function buildGallerySlider() {
  if (!currentGalleryData) return;

  const sliderMain = $('#modalSliderMain');
  if (!sliderMain) return;

  // Clear existing content
  sliderMain.innerHTML = '';

  const { images, video } = currentGalleryData;
  const allMedia = [...images];
  if (video) allMedia.push(video);

  // Create slides
  allMedia.forEach((src, index) => {
    const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');

    if (isVideo) {
      const videoEl = document.createElement('video');
      videoEl.src = src;
      videoEl.controls = true;
      videoEl.preload = 'metadata';
      videoEl.className = index === 0 ? 'active' : '';
      sliderMain.appendChild(videoEl);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = currentGalleryData.title;
      img.className = index === 0 ? 'active' : '';
      sliderMain.appendChild(img);
    }
  });

  // Update counter
  updateImageCounter();
}

// Build Gallery Thumbnails
function buildGalleryThumbnails() {
  if (!currentGalleryData) return;

  const thumbContainer = $('#galleryThumbnails');
  if (!thumbContainer) return;

  // Clear existing
  thumbContainer.innerHTML = '';

  const { images, video } = currentGalleryData;
  const allMedia = [...images];
  if (video) allMedia.push(video);

  // Create thumbnails
  allMedia.forEach((src, index) => {
    const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');

    const thumbDiv = document.createElement('div');
    thumbDiv.className = `thumbnail-item ${index === 0 ? 'active' : ''} ${isVideo ? 'video-thumb' : ''}`;
    thumbDiv.onclick = () => showGalleryItem(index);

    if (isVideo) {
      const videoEl = document.createElement('video');
      videoEl.src = src;
      videoEl.muted = true;
      videoEl.preload = 'none';
      thumbDiv.appendChild(videoEl);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `thumbnail ${index + 1}`;
      thumbDiv.appendChild(img);
    }

    thumbContainer.appendChild(thumbDiv);
  });
}

// Navigate Gallery
function navigateGallery(direction) {
  if (!currentGalleryData) return;

  const { images, video } = currentGalleryData;
  const totalItems = images.length + (video ? 1 : 0);

  currentImageIndex += direction;

  // Loop around
  if (currentImageIndex < 0) currentImageIndex = totalItems - 1;
  if (currentImageIndex >= totalItems) currentImageIndex = 0;

  showGalleryItem(currentImageIndex);
}

// Show Specific Gallery Item
function showGalleryItem(index) {
  if (!currentGalleryData) return;

  currentImageIndex = index;

  // Update main slider
  const sliderMain = $('#modalSliderMain');
  if (sliderMain) {
    const allItems = sliderMain.children;
    Array.from(allItems).forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
        // Play video if it's the active item
        if (item.tagName === 'VIDEO') {
          item.play();
        }
      } else {
        item.classList.remove('active');
        // Pause other videos
        if (item.tagName === 'VIDEO') {
          item.pause();
        }
      }
    });
  }

  // Update thumbnails
  const thumbs = $$('.thumbnail-item');
  thumbs.forEach((thumb, i) => {
    if (i === index) {
      thumb.classList.add('active');
    } else {
      thumb.classList.remove('active');
    }
  });

  // Update counter
  updateImageCounter();
}

// Update Image Counter
function updateImageCounter() {
  if (!currentGalleryData) return;

  const counter = $('#imageCounter');
  if (!counter) return;

  const { images, video } = currentGalleryData;
  const total = images.length + (video ? 1 : 0);

  counter.textContent = `${currentImageIndex + 1} / ${total}`;
}

// Keyboard Navigation for Gallery Modal
document.addEventListener('keydown', (e) => {
  const modal = $('#galleryModal');
  if (modal && modal.classList.contains('visible')) {
    if (e.key === 'Escape') {
      closeGalleryModal();
    } else if (e.key === 'Tab') {
      trapTabKey(modal, e);
    } else if (e.key === 'ArrowLeft') {
      navigateGallery(1); // RTL: left = next
    } else if (e.key === 'ArrowRight') {
      navigateGallery(-1); // RTL: right = previous
    }
  }
});

// Close modal when clicking outside content
document.addEventListener('click', (e) => {
  const modal = $('#galleryModal');
  if (e.target === modal) {
    closeGalleryModal();
  }
});


// ==============================
// Material Popover Bubble Logic
// ==============================

const materialBubble = document.getElementById('materialBubble');
const closeBubbleBtn = document.getElementById('closeBubbleBtn');
let activeTriggerEl = null;

function hideBubble() {
  if (materialBubble) {
    materialBubble.classList.remove('active');
    // Remove active class from all materials
    document.querySelectorAll('.clickable-material').forEach(el => el.classList.remove('active-material'));
    activeTriggerEl = null;
  }
}

if (closeBubbleBtn) {
  closeBubbleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideBubble();
  });
}

// Close when clicking the backdrop (pseudo-element area handles clicks outside content effectively if structured right,
// but since pseudo is part of element, clicking 'outside' inside the fixed container works if we check target)
// OR: simple click outside check.
document.addEventListener('click', (e) => {
  if (materialBubble && materialBubble.classList.contains('active')) {
    // If click is directly on the bubble container (which covers screen via pseudo or just fixed box?)
    // Our CSS has bubble as the small box. The backdrop is ::before.
    // ::before clicks register on the element itself usually? No, pseudo elements don't capture events separately easily.
    // Better strategy: Use a global click handler.

    // If click target is NOT inside the bubble content (which is the element itself)
    // wait, the element IS the bubble.
    // We need to differentiate clicking the 'space' around it.
    // Since we didn't use a wrapper div for backdrop, we rely on document click.

    // However, if the click is on the trigger, we handle that in show.
    if (activeTriggerEl && !materialBubble.contains(e.target) && !activeTriggerEl.contains(e.target)) {
      hideBubble();
    }
  }
});
// Also close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideBubble();
});


// Function to Show Bubble
function showMaterialBubble(element) {
  // Toggle off if clicking same element
  if (activeTriggerEl === element && materialBubble.classList.contains('active')) {
    hideBubble();
    return;
  }

  // 1. Reset Active State
  document.querySelectorAll('.clickable-material').forEach(el => el.classList.remove('active-material'));
  element.classList.add('active-material');
  activeTriggerEl = element;

  // 2. Get Data
  const title = element.querySelector('h5')?.textContent || '';
  const subtitle = element.querySelector('.price-badge')?.textContent || '';
  const prosData = element.getAttribute('data-pros');
  const consData = element.getAttribute('data-cons');

  if (!prosData && !consData) return;

  const prosList = prosData ? prosData.split('|') : ['لا توجد بيانات متاحة'];
  const consList = consData ? consData.split('|') : ['لا توجد عيوب جوهرية مسجلة'];

  // 3. Populate Bubble
  const bTitle = document.getElementById('bubbleTitle');
  const bSubtitle = document.getElementById('bubbleSubtitle');
  const bPros = document.getElementById('bubbleProsList');
  const bCons = document.getElementById('bubbleConsList');

  if (bTitle) bTitle.textContent = title;
  if (bSubtitle) bSubtitle.textContent = subtitle;

  if (bPros) bPros.innerHTML = prosList.map(item => `<li>${item.trim()}</li>`).join('');
  if (bCons) bCons.innerHTML = consList.map(item => `<li>${item.trim()}</li>`).join('');

  // 4. Show (Centered via CSS)
  materialBubble.style.display = 'block';

  requestAnimationFrame(() => {
    materialBubble.classList.add('active');
  });

  // Refresh icons
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
  // Event Delegation
  document.body.addEventListener('click', function (e) {
    const card = e.target.closest('.clickable-material');
    if (card) {
      e.stopPropagation(); // Prevent immediate body close
      showMaterialBubble(card);
    }
  });

  // --- 3D Tilt Effect Removed by User Request ---

  // Accessibility fallback: ensure mouse-only cards are keyboard operable
  // (static markup already carries tabindex/role; this covers dynamic content).
  enhanceCardAccessibility();
});

// One delegated keydown listener for gallery + material cards (Enter/Space).
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target && e.target.closest
    ? e.target.closest('.gallery-item[data-gallery-id], .clickable-material')
    : null;
  if (!card) return;
  // Let native controls (links/buttons/inputs inside) handle their own keys.
  if (e.target !== card) return;
  e.preventDefault();
  if (card.classList.contains('clickable-material')) {
    showMaterialBubble(card);
  } else if (card.dataset.galleryId) {
    openGalleryModal(card.dataset.galleryId, e);
  }
});

function enhanceCardAccessibility() {
  document
    .querySelectorAll('.gallery-item[data-gallery-id], .clickable-material')
    .forEach((el) => {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    });
}

// ==============================
// Facebook Slider Functionality
// ==============================

function initFacebookSlider() {
  const container = document.querySelector('.fb-slider-container');
  const wrapper = document.getElementById('fbSliderWrapper');
  const slides = document.querySelectorAll('.fb-slide');
  const prevBtn = document.querySelector('.fb-nav-btn.prev');
  const nextBtn = document.querySelector('.fb-nav-btn.next');
  const dotsContainer = document.getElementById('fbDots');

  if (!wrapper || slides.length === 0) return;

  // Click-to-load facades: inject the original iframe (same src/title/attributes) only on click
  wrapper.querySelectorAll('.fb-facade').forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.src;
      if (!src || btn.dataset.loaded === 'true') return;
      btn.dataset.loaded = 'true';
      const iframe = document.createElement('iframe');
      iframe.title = btn.dataset.title || 'منشور من صفحة الماسية للمطابخ على فيسبوك';
      iframe.src = src;
      iframe.width = btn.dataset.width || '500';
      iframe.height = btn.dataset.height || '600';
      iframe.setAttribute('style', 'border:none;overflow:hidden');
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');
      iframe.setAttribute('loading', 'lazy');
      btn.replaceWith(iframe);
      updateSlider();
      setTimeout(updateSlider, 500);
    }, { once: true });
  });

  let currentIndex = 0;
  const slideCount = slides.length;

  // Create Dots
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `fb-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.fb-dot');

  function getFbGap() {
    const style = getComputedStyle(wrapper);
    return parseFloat(style.columnGap || style.gap) || 0;
  }

  function getFbTargetLeft(target) {
    // Physical layout position of the target slide relative to the wrapper (RTL-safe).
    if (target.offsetParent === wrapper) return target.offsetLeft;
    if (target.offsetParent && target.offsetParent === wrapper.offsetParent) {
      return target.offsetLeft - wrapper.offsetLeft - (wrapper.clientLeft || 0);
    }
    // Fallback: accumulate real widths + real computed gap (handles differing reel/post widths).
    const gap = getFbGap();
    let left = 0;
    for (let i = 0; i < currentIndex; i++) {
      left += slides[i].offsetWidth + gap;
    }
    return left;
  }

  function updateSlider() {
    if (slides.length === 0) return;

    const target = slides[currentIndex];
    if (!target) return;
    getFbGap(); // read real computed gap (20px mobile / 50px desktop); positions below already include it
    const targetWidth = target.offsetWidth || (container.offsetWidth - 100); // Fallback
    const targetLeft = getFbTargetLeft(target);
    const wrapperLeft = wrapper.offsetLeft || 0;

    // Center the target slide in the container using physical coordinates (works in RTL).
    const containerCenter = container.offsetWidth / 2;
    const targetCenter = wrapperLeft + targetLeft + targetWidth / 2;
    const finalTranslate = containerCenter - targetCenter;
    wrapper.style.transform = `translateX(${finalTranslate}px)`;

    // Update active class for CSS effects
    slides.forEach((s, index) => {
      if (index === currentIndex) {
        s.classList.add('active');
        s.setAttribute('aria-hidden', 'false');
      } else {
        s.classList.remove('active');
        s.setAttribute('aria-hidden', 'true');
      }
    });

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    updateSlider();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slideCount;
    updateSlider();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slideCount) % slideCount;
    updateSlider();
  }

  // --- Autoplay Logic ---
  let autoplayInterval;
  const autoplayDelay = 4000;

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayInterval) clearInterval(autoplayInterval);
  }

  // Event Listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoplay(); // Reset timer
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoplay(); // Reset timer
    });
  }

  // Pause on Hover
  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', startAutoplay);

  // Responsive adjustment
  window.addEventListener('resize', updateSlider);

  // Initialize
  updateSlider();
  setTimeout(updateSlider, 500);
  setTimeout(() => {
    updateSlider();
    startAutoplay();
  }, 1000);
}

/**
 * Premium Modal System
 */
let lastPremiumFocus = null;

window.showPremiumModal = function (options = {}) {
  const {
    title = 'تنبيه',
    message = '',
    icon = 'info',
    confirmText = 'حسناً',
    cancelText = null,
    onConfirm = null,
    onCancel = null,
    type = 'info'
  } = options;

  const modal = document.getElementById('premiumModal');
  const mTitle = document.getElementById('modalTitle');
  const mMessage = document.getElementById('modalMessage');
  const mIcon = document.getElementById('modalIcon');
  const mFooter = document.getElementById('modalFooter');

  if (!modal) return;

  mTitle.textContent = title;
  mMessage.innerHTML = message;

  // Set Icon
  let iconName = 'info';
  if (icon === 'success') iconName = 'check-circle';
  if (icon === 'error') iconName = 'alert-triangle';
  if (icon === 'help') iconName = 'help-circle';

  mIcon.innerHTML = `<i data-lucide="${iconName}"></i>`;

  // Set Buttons
  mFooter.innerHTML = '';

  if (cancelText) {
    const btnCancel = document.createElement('button');
    btnCancel.className = 'btn btn-ghost';
    btnCancel.textContent = cancelText;
    btnCancel.onclick = () => {
      closePremiumModal();
      if (onCancel) onCancel();
    };
    mFooter.appendChild(btnCancel);
  }

  const btnConfirm = document.createElement('button');
  btnConfirm.className = 'btn btn-primary';
  btnConfirm.textContent = confirmText;
  btnConfirm.onclick = () => {
    closePremiumModal();
    if (onConfirm) onConfirm();
  };
  mFooter.appendChild(btnConfirm);

  // Show
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Move focus to the close button and remember where to restore it.
  lastPremiumFocus = document.activeElement;
  focusModalClose(modal, '.premium-modal-close');

  // Re-init lucide
  if (window.lucide) lucide.createIcons();
};

window.closePremiumModal = function () {
  const modal = document.getElementById('premiumModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  // Restore focus to the element that opened the modal.
  if (lastPremiumFocus && document.contains(lastPremiumFocus)) {
    lastPremiumFocus.focus();
  }
  lastPremiumFocus = null;
};

// Keyboard support for the premium modal: Escape closes, Tab stays trapped.
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('premiumModal');
  if (modal && modal.classList.contains('active')) {
    if (e.key === 'Escape') {
      closePremiumModal();
    } else if (e.key === 'Tab') {
      trapTabKey(modal, e);
    }
  }
});

/**
 * Gallery Zoom Logic
 */
let currentZoom = 1;

window.zoomGalleryImage = function (factor) {
  const activeImage = document.querySelector('.slider-main img.active');
  if (!activeImage) return;

  currentZoom *= factor;

  // Constraints
  if (currentZoom < 1) currentZoom = 1;
  if (currentZoom > 3) currentZoom = 3;

  activeImage.style.transform = `scale(${currentZoom})`;

  // If zoomed in, allow dragging or better centering? 
  // For now, simple centered zoom is enough for "premium" feel.
};

window.resetGalleryZoom = function () {
  currentZoom = 1;
  const images = document.querySelectorAll('.slider-main img');
  images.forEach(img => {
    img.style.transform = 'scale(1)';
  });
};

// Expose inline-handler functions on window.
// ES modules do not create globals, but index.html calls these via onclick="...".
window.loadMoreGalleryItems = loadMoreGalleryItems;
window.openGalleryModal = openGalleryModal;
window.closeGalleryModal = closeGalleryModal;
window.navigateGallery = navigateGallery;
window.showGalleryItem = showGalleryItem;
