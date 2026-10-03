// ==============================
// Enhanced Website Functionality with Performance Improvements
// ==============================

// Helper: safe querySelector with error handling
const $ = (sel, ctx = document) => {
  try {
    return ctx.querySelector(sel);
  } catch (error) {
    console.warn('Query selector error:', error);
    return null;
  }
};

const $$ = (sel, ctx = document) => {
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
const appState = {
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
function debounce(func, wait) {
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
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}


// Show notification function
function showNotification(message, type = 'info') {
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

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
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
function formatNumber(number) {
  return new Intl.NumberFormat('ar-EG').format(number);
}

// Initialize components dynamically
function initComponent(element) {
  // Add ripple effect to buttons
  if (element.classList && (element.classList.contains('btn') || element.classList.contains('btn-primary') || element.classList.contains('btn-ghost'))) {
    element.addEventListener('click', createRipple);
  }

  // Initialize reveal elements
  if (element.classList && element.classList.contains('reveal')) {
    revealObserver.observe(element);
  }
}

// Analytics tracking function
function trackEvent(category, action, label) {
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

// Lazy Loading for Images
function initLazyLoading() {
  const lazyImages = $$('img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('skeleton');
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  }
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

  // Initialize reviews slider
  if (reviewCards.length > 0) {
    showReview(0);

    // Auto-advance reviews every 5 seconds
    timers.reviewInterval = setInterval(() => {
      const nextReview = (appState.currentReview + 1) % reviewCards.length;
      showReview(nextReview);
    }, 5000);
  }

  // Global Review Controls (Exposed for HTML onclick)
  window.nextReview = () => {
    const nextIdx = (appState.currentReview + 1) % reviewCards.length;
    showReview(nextIdx);
    clearInterval(timers.reviewInterval);
    timers.reviewInterval = setInterval(() => {
      const next = (appState.currentReview + 1) % reviewCards.length;
      showReview(next);
    }, 5000);
  };

  window.prevReview = () => {
    const prevIdx = (appState.currentReview - 1 + reviewCards.length) % reviewCards.length;
    showReview(prevIdx);
    clearInterval(timers.reviewInterval);
    timers.reviewInterval = setInterval(() => {
      const next = (appState.currentReview + 1) % reviewCards.length;
      showReview(next);
    }, 5000);
  };

  // Event delegation for review indicators
  document.addEventListener('click', function (e) {
    if (e.target.matches('.indicator')) {
      const index = parseInt(e.target.getAttribute('data-slide'));

      // Reset interval when user manually changes slide
      clearInterval(timers.reviewInterval);
      showReview(index);

      // Restart auto-advance
      timers.reviewInterval = setInterval(() => {
        const nextReview = (appState.currentReview + 1) % reviewCards.length;
        showReview(nextReview);
      }, 5000);
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

      const name = this.querySelector('input[type="text"]').value;
      const phone = this.querySelector('input[type="tel"]').value;
      const date = this.querySelector('input[type="date"]').value;

      if (!name || !phone) {
        alert('الرجاء إدخال الاسم ورقم الهاتف');
        return;
      }

      const message = `حجز استشارة مجانية:\nالاسم: ${name}\nالهاتف: ${phone}\nالتاريخ المفضل: ${date || 'غير محدد'}`;
      const whatsappUrl = `https://wa.me/201092497811?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      this.reset();
      alert('تم إرسال طلب الحجز بنجاح! سيتم التواصل معك لتأكيد الموعد.');

      trackEvent('booking', 'consultation_request', 'free_consultation');
    });
  }
}



// Run main DOM ready
document.addEventListener('DOMContentLoaded', function () {

  // --- Year in footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Preloader hide on load - Enhanced with Font Check & Slow Network
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const preloader = document.getElementById('preloader');
  const slowNetworkMsg = document.getElementById('slowNetworkMsg');

  let progress = 0;
  let fontLoaded = false;
  let pageLoaded = false;

  // Slow Network Detection Timer (5 seconds)
  const networkTimer = setTimeout(() => {
    if (progress < 90 && slowNetworkMsg) {
      slowNetworkMsg.classList.remove('hidden');
      slowNetworkMsg.style.display = 'flex'; // Force display flex
    }
  }, 5000);

  // Check for font loading
  if (document.fonts) {
    document.fonts.ready.then(() => {
      fontLoaded = true;
      console.log('Fonts loaded');
    });
  } else {
    // Fallback for older browsers
    fontLoaded = true;
  }

  // Simulate loading progress with checks
  const interval = setInterval(() => {
    // Increment logic
    const increment = Math.floor(Math.random() * 5) + 2;

    // Don't go past 90% until fonts and page are loaded
    if (progress < 90 || (fontLoaded && pageLoaded)) {
      progress += increment;
    }

    if (progress > 100) progress = 100;

    // Update UI
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${progress}%`;

    // Complete only if 100% AND everything is loaded
    if (progress === 100) {
      clearInterval(interval);
      clearTimeout(networkTimer); // Clear warning timer

      // Wait a moment at 100% then hide
      setTimeout(() => {
        if (preloader) {
          preloader.classList.add('hidden');
          document.body.classList.add('loaded');

          // Remove from DOM after transition (0.5s is common for these animations)
          setTimeout(() => {
            preloader.remove();
          }, 600);
        }
      }, 500);
    }
  }, 30); // Speed of update

  window.addEventListener('load', function () {
    pageLoaded = true;
    console.log('Page assets loaded');

    // Track page load time
    const loadTime = Date.now() - appState.pageLoadTime;
    console.log(`Page loaded in ${loadTime}ms`);
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
        <i data-lucide="plus-circle" class="premium-icon sm" style="margin-left: 0.5rem;"></i>
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
        <i data-lucide="check-circle" class="premium-icon sm" style="margin-left: 0.5rem;"></i>
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

// Gallery filters with skeleton loading
function initGallery() {
  const filterBtns = $$('.filter-btn');
  const skeletonGrid = $('#skeletonGrid');
  const galleryGrid = $('#galleryGrid');

  // Load gallery images dynamically
  function loadGalleryImages() {
    const galleryItems = $$('.gallery-grid .item');

    // Show skeleton first
    if (skeletonGrid) skeletonGrid.style.display = 'grid';
    // Only hide gallery grid if it exists to avoid errors
    if (galleryGrid) galleryGrid.style.display = 'none';

    // Simulate loading delay
    setTimeout(() => {
      if (skeletonGrid) skeletonGrid.style.display = 'none';
      if (galleryGrid) galleryGrid.style.display = 'grid';
    }, 1000);
  }

  // Event delegation for filter buttons
  document.addEventListener('click', function (e) {
    if (e.target.matches('.filter-btn')) {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');

      // Show skeleton during filtering
      loadGalleryImages();

      // Actual filtering after a delay
      setTimeout(() => {
        filterGallery(filter);
      }, 500);

      trackEvent('gallery', 'filter', filter);
    }
  });

  // Initial load
  loadGalleryImages();
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
          <i data-lucide="check-circle" class="premium-icon sm" style="margin-left: 0.5rem;"></i>
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

function highlightSearchTerm(element, term) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const nodes = [];
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent.toLowerCase().includes(term)) {
      nodes.push(node);
    }
  }

  nodes.forEach(textNode => {
    const span = document.createElement('span');
    span.className = 'search-highlight';
    span.style.backgroundColor = 'rgba(212,175,55,0.3)';
    span.style.padding = '0.1rem 0.2rem';
    span.style.borderRadius = '3px';

    const text = textNode.textContent;
    const regex = new RegExp(term, 'gi');
    const newText = text.replace(regex, match => `<span class="search-highlight">${match}</span>`);

    const wrapper = document.createElement('span');
    wrapper.innerHTML = newText;
    textNode.parentNode.replaceChild(wrapper, textNode);
  });
}

// Initialize all components
function initComponents() {
  initThemeToggle();
  initMobileMenu();
  initRevealAnimations();
  initHeaderScroll();
  initLazyLoading();
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
  initExitPrevention();
}

function initHero3DParallax() {
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

// Open Gallery Modal
function openGalleryModal(galleryId, event) {
  // Prevent event bubbling to avoid triggering old lightbox
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const galleryCard = document.querySelector(`[data-gallery-id="${galleryId}"]`);
  if (!galleryCard) return;

  // Get data from card attributes
  const title = galleryCard.dataset.title;
  const description = galleryCard.dataset.description;
  const price = galleryCard.dataset.price;
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
});

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

  function updateSlider() {
    // Get container width or slide width
    const containerWidth = container.offsetWidth;
    const slide = slides[0];
    const slideWidth = slide.offsetWidth + 30; // gap is 30px

    // In RTL, we might need to adjust logic if the container is RTL
    const isRTL = getComputedStyle(document.body).direction === 'rtl';
    const offset = currentIndex * slideWidth;

    // Simple transition
    wrapper.style.transform = `translateX(${isRTL ? offset : -offset}px)`;

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });

    // Handle accessibility
    slides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', index !== currentIndex);
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

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // Responsive adjustment
  window.addEventListener('resize', updateSlider);

  // Initialize
  setTimeout(updateSlider, 500); // Small delay to ensure layout is ready
}

// Accidental Exit Prevention (Double back to exit)
function initExitPrevention() {
  let lastBackPress = 0;
  const backPressThreshold = 2000; // 2 seconds

  // Push a state to history to intercept the first back gesture
  if (window.history && window.history.pushState) {
    window.history.pushState('onSite', null, '');

    window.addEventListener('popstate', function (event) {
      const now = Date.now();

      if (now - lastBackPress < backPressThreshold) {
        // Double back pressed within threshold - allow exit
        window.history.back();
      } else {
        // First back press or outside threshold - block and notify
        window.history.pushState('onSite', null, ''); // Push back to stay on page
        lastBackPress = now;

        showNotification('اسحب مرة أخرى للخروج من الموقع', 'info');

        // Track the blocked exit attempt
        trackEvent('engagement', 'exit_blocked', 'back_gesture');
      }
    });
  }

  // Also handle beforeunload for desktop/tab closing consistency
  window.addEventListener('beforeunload', function (e) {
    // Note: most modern browsers only show a standard message, not custom ones
    // but this helps if they have unsaved changes or just to be safe.
    // However, the user specifically asked for gesture support, so popstate is key.
  });
}
/**
 * Scrollytelling Animation for Massia Kitchen
 * Inspired by Microsoft Edge Year in Review
 * Uses GSAP, ScrollTrigger, and Lenis for smooth scrolling
 */

function initScrollytelling() {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // 2. Scrollytelling Logic
    const section = document.querySelector('.scrolly-section');
    const sticky = document.querySelector('.scrolly-sticky');
    const card = document.querySelector('.scrolly-card');
    const bgItems = document.querySelectorAll('.p-item');
    const glows = document.querySelectorAll('.scrolly-section .ambient-glow');

    if (!section || !card) return;

    // Create the main timeline tied to scroll
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            pin: false
        }
    });

    // Initial State: Items appear straight and visible
    gsap.set(bgItems, {
        y: (i) => (i % 2 === 0 ? 100 : -100),
        x: (i) => (i % 3 === 0 ? 50 : -50),
        rotate: 0, // No rotation as requested
        scale: 0.85,
        opacity: 1, // Full opacity as requested
        filter: "blur(0px)"
    });

    gsap.set(glows, { opacity: 0.15, scale: 0.8 });

    // Card starts VISIBLE as it is the Hero
    gsap.set(card, { opacity: 1, y: 0, scale: 1 });

    // 2.5 Staggered Entrance for Trust Badges
    const badges = card.querySelectorAll('.badge');
    if (badges.length > 0) {
        gsap.to(badges, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            stagger: {
                each: 0.12,
                from: "center"
            },
            ease: "back.out(2)",
            delay: 0.8,
            onComplete: () => {
                // Remove initial transform to let CSS float keyframe take over safely
                gsap.set(badges, { clearProps: "y,scale" });
            }
        });
    }

    // Animation Sequence
    tl.to(bgItems, {
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        stagger: 0.01,
        duration: 0.2
    }, 0)
        .to(glows, {
            opacity: 0.3,
            scale: 1,
            duration: 0.2
        }, 0)
        // 2. Separate card slightly
        .to(card, {
            y: -5,
            duration: 0.2
        }, 0)

        // 3. Parallax Exit phase (Keeping elements visible as requested)
        .to(bgItems, {
            y: (i, target) => {
                const speed = parseFloat(target.dataset.speed) || 0.5;
                return -150 * speed; // More subtle parallax exit
            },
            x: (i) => (i % 2 === 0 ? -10 : 10),
            scale: 1.05,
            opacity: 0.8, // Stay visible
            duration: 0.5,
            ease: "power2.out"
        }, 0.5)
        .to(card, {
            opacity: 1, // Stay fully visible
            scale: 0.98,
            y: -20,
            duration: 0.5,
            ease: "power2.out"
        }, 0.5);

    // Mouse movement parallax (Subtle)
    sticky.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth) - 0.5;
        const yPos = (clientY / window.innerHeight) - 0.5;

        bgItems.forEach((item, i) => {
            const factor = (i + 1) * 10;
            gsap.to(item, {
                x: `+=${xPos * factor}`,
                y: `+=${yPos * factor}`,
                duration: 2,
                ease: "power2.out",
                overwrite: 'auto'
            });
        });

        gsap.to(card, {
            rotationY: xPos * 5,
            rotationX: -yPos * 5,
            duration: 1.5,
            ease: "power2.out"
        });
    });
}

// Initialize on load
window.addEventListener('load', () => {
    if (window.gsap && window.ScrollTrigger) {
        initScrollytelling();
    }
});
// ==============================
// Cost Calculator Functions
// ==============================

// Price configurations - تم التحديث حسب متطلباتك
const PRICE_CONFIG = {
  base: {
    economy: 3000,  // MDF
    standard: 4000, // ألومنيوم
    premium: 5800   // HPL
  },
  drawer: {
    economy: 150,
    standard: 200,
    premium: 250
  },
  addon: {
    counter: 500,  // كونتر جوود وود لكل متر
    led: 200,      // إضاءة LED لكل متر
    handles: 100,  // مقابض بلت إن
    drawers: 300   // أدراج سحاب
  },
  appliance: {
    oven: 3000,
    cooktop: 1500,
    hood: 1200,
    fridge: 8000
  },
  installation: 2000,
  cabinet: {
    wall: 800,
    base: 1200
  }
};

// Cost Calculator Functions - تم التحديث
function updateCalculator() {
  const area = appState.calculatorData.area;
  const material = appState.calculatorData.material;
  const drawers = appState.calculatorData.drawers;
  const addons = appState.calculatorData.addons;
  const appliances = appState.calculatorData.appliances;

  // Calculate base cost
  const baseCost = PRICE_CONFIG.base[material] * area;

  // Calculate drawers cost
  const drawersCost = PRICE_CONFIG.drawer[material] * drawers;

  // Calculate addons cost (تضاف لكل متر)
  const addonsCost = addons.reduce((total, addon) => {
    return total + (PRICE_CONFIG.addon[addon] * area);
  }, 0);

  // Calculate appliances cost
  const appliancesCost = appliances.reduce((total, appliance) => {
    return total + (PRICE_CONFIG.appliance[appliance] || 0);
  }, 0);

  // Total manufacturing cost
  const manufacturingCost = baseCost + drawersCost;

  // Material cost (40% of manufacturing)
  const materialCost = Math.round(manufacturingCost * 0.4);

  // Total cost
  const totalCost = manufacturingCost + addonsCost + appliancesCost + PRICE_CONFIG.installation;

  // Update UI
  updateCalculatorUI(totalCost, manufacturingCost, materialCost, PRICE_CONFIG.installation, addonsCost);
}

function updateCalculatorByDimensions() {
  const length = appState.calculatorData.length;
  const width = appState.calculatorData.width;
  const material = appState.calculatorData.material;
  const wallCabinets = appState.calculatorData.wallCabinets;
  const baseCabinets = appState.calculatorData.baseCabinets;
  const addons = appState.calculatorData.addons;

  // Calculate area
  const area = length * width;

  // Calculate base cost
  const baseCost = PRICE_CONFIG.base[material] * area;

  // Calculate cabinets cost
  const wallCabinetsCost = PRICE_CONFIG.cabinet.wall * wallCabinets;
  const baseCabinetsCost = PRICE_CONFIG.cabinet.base * baseCabinets;
  const cabinetsCost = wallCabinetsCost + baseCabinetsCost;

  // Calculate addons cost (تضاف لكل متر)
  const addonsCost = addons.reduce((total, addon) => {
    return total + (PRICE_CONFIG.addon[addon] * area);
  }, 0);

  // Total manufacturing cost
  const manufacturingCost = baseCost + cabinetsCost;

  // Material cost (40% of manufacturing)
  const materialCost = Math.round(manufacturingCost * 0.4);

  // Total cost
  const totalCost = manufacturingCost + addonsCost + PRICE_CONFIG.installation;

  // Update UI
  updateCalculatorUI(totalCost, manufacturingCost, materialCost, PRICE_CONFIG.installation, addonsCost);
}

function updateCalculatorUI(total, manufacturing, material, installation, addons = 0) {
  const estimatedCost = $('#estimated-cost');
  const manufacturingCost = $('#manufacturing-cost');
  const materialCost = $('#material-cost');
  const installationCost = $('#installation-cost');
  const addonsCost = $('#addons-cost');

  if (estimatedCost) estimatedCost.textContent = `${formatNumber(total)} جنيه`;
  if (manufacturingCost) manufacturingCost.textContent = `${formatNumber(manufacturing)} ج`;
  if (materialCost) materialCost.textContent = `${formatNumber(material)} ج`;
  if (installationCost) installationCost.textContent = `${formatNumber(installation)} ج`;
  if (addonsCost) addonsCost.textContent = `${formatNumber(addons)} ج`;
}

function updateRecommendation() {
  const area = parseInt(document.getElementById('kitchen-area').value);
  const material = document.getElementById('material-type').value;

  let recommendedMaterial = 'شيت ألومنيوم';
  let reason = 'مثالي للمساحات المتوسطة، يجمع بين المتانة والسعر المعقول';

  if (area > 20) {
    recommendedMaterial = 'HPL';
    reason = 'مثالي للمساحات الكبيرة، متانة عالية وتنظيف سهل - الأكثر مبيعاً';
  } else if (area < 10) {
    recommendedMaterial = 'كلادينج';
    reason = 'مثالي للمساحات الصغيرة، مقاوم للرطوبة وسهل الصيانة';
  }

  if (material === 'premium') {
    recommendedMaterial = 'بولي باك جوود وود';
    reason = 'أعلى مستوى جودة مع مظهر خشب طبيعي فاخر';
  }

  document.getElementById('recommended-material').textContent = recommendedMaterial;
  document.getElementById('recommendation-reason').textContent = reason;
}

function initCalculator() {
  const areaSlider = $('#kitchen-area');
  const areaValue = $('#area-value');
  const materialSelect = $('#material-type');
  const drawersSlider = $('#drawers-count');
  const drawersValue = $('#drawers-value');
  const addonCheckboxes = $$('input[name="addons"]');
  const applianceCheckboxes = $$('input[name="appliances"]');

  // Dimension inputs
  const lengthInput = $('#kitchen-length');
  const widthInput = $('#kitchen-width');
  const wallCabinetsSlider = $('#wall-cabinets');
  const wallCabinetsValue = $('#wall-cabinets-value');
  const baseCabinetsSlider = $('#base-cabinets');
  const baseCabinetsValue = $('#base-cabinets-value');
  const addonDimensionsCheckboxes = $$('input[name="addons-dimensions"]');

  // Calculator tabs functionality
  const calculatorTabs = $$('.calculator-tab');

  // Event delegation for calculator tabs
  document.addEventListener('click', function (e) {
    if (e.target.matches('.calculator-tab')) {
      const targetTab = e.target.getAttribute('data-tab');

      // إزالة النشاط من جميع الألسنة
      calculatorTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.calculator-tab-content').forEach(c => c.classList.remove('active'));

      // إضافة النشاط للسان المحدد
      e.target.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');

      trackEvent('calculator', 'tab_switch', targetTab);
    }
  });

  // Area slider
  if (areaSlider && areaValue) {
    areaSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      appState.calculatorData.area = parseInt(value);
      areaValue.textContent = `${value} م²`;
      updateCalculator();
      updateRecommendation();
    });
  }

  // Material select
  if (materialSelect) {
    materialSelect.addEventListener('change', (e) => {
      appState.calculatorData.material = e.target.value;
      updateCalculator();
      updateRecommendation();
    });
  }

  // Material select for dimensions tab
  const materialSelectDimensions = $('#material-type-dimensions');
  if (materialSelectDimensions) {
    materialSelectDimensions.addEventListener('change', (e) => {
      appState.calculatorData.material = e.target.value;
      updateCalculatorByDimensions();
    });
  }

  // Drawers slider
  if (drawersSlider && drawersValue) {
    drawersSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      appState.calculatorData.drawers = parseInt(value);
      drawersValue.textContent = `${value} قطعة`;
      updateCalculator();
    });
  }

  // Addon checkboxes (تضاف لكل متر)
  addonCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;
      if (e.target.checked) {
        appState.calculatorData.addons.push(value);
      } else {
        appState.calculatorData.addons = appState.calculatorData.addons.filter(addon => addon !== value);
      }
      updateCalculator();
    });
  });

  // Appliance checkboxes
  applianceCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;
      if (e.target.checked) {
        appState.calculatorData.appliances.push(value);
      } else {
        appState.calculatorData.appliances = appState.calculatorData.appliances.filter(app => app !== value);
      }
      updateCalculator();
    });
  });

  // Dimension inputs
  if (lengthInput) {
    lengthInput.addEventListener('input', (e) => {
      appState.calculatorData.length = parseFloat(e.target.value);
      updateCalculatorByDimensions();
    });
  }

  if (widthInput) {
    widthInput.addEventListener('input', (e) => {
      appState.calculatorData.width = parseFloat(e.target.value);
      updateCalculatorByDimensions();
    });
  }

  if (wallCabinetsSlider && wallCabinetsValue) {
    wallCabinetsSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      appState.calculatorData.wallCabinets = parseInt(value);
      wallCabinetsValue.textContent = `${value} وحدة`;
      updateCalculatorByDimensions();
    });
  }

  if (baseCabinetsSlider && baseCabinetsValue) {
    baseCabinetsSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      appState.calculatorData.baseCabinets = parseInt(value);
      baseCabinetsValue.textContent = `${value} وحدة`;
      updateCalculatorByDimensions();
    });
  }

  // Addon checkboxes for dimensions
  addonDimensionsCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const value = e.target.value;
      if (e.target.checked) {
        appState.calculatorData.addons.push(value);
      } else {
        appState.calculatorData.addons = appState.calculatorData.addons.filter(addon => addon !== value);
      }
      updateCalculatorByDimensions();
    });
  });

  // Sync calculator with user selection from pricing tabs
  window.syncCalculatorWithSelection = function (material, options) {
    const materialTypeSelect = document.getElementById('material-type');
    const materialTypeSelectDim = document.getElementById('material-type-dimensions');
    const addonCheckboxes = document.querySelectorAll('input[name="addons"]');

    // Map material name to type key
    let typeKey = 'economy';
    const name = material.name.toLowerCase();
    if (name.includes('ألومنيوم') || name.includes('الومنيوم')) typeKey = 'standard';
    if (name.includes('hpl') || name.includes('بولي') || name.includes('بورديوم')) typeKey = 'premium';

    // Update state and select elements
    appState.calculatorData.material = typeKey;
    if (materialTypeSelect) materialTypeSelect.value = typeKey;
    if (materialTypeSelectDim) materialTypeSelectDim.value = typeKey;

    // Update addons
    appState.calculatorData.addons = [];
    addonCheckboxes.forEach(cb => {
      const optionMatch = options.find(opt => {
        const optName = opt.name.toLowerCase();
        const cbValue = cb.value.toLowerCase();
        return optName.includes(cbValue) || cbValue.includes(optName);
      });

      cb.checked = !!optionMatch;
      if (cb.checked) {
        appState.calculatorData.addons.push(cb.value);
      }
    });

    // Trigger recalculation
    updateCalculator();
    updateCalculatorByDimensions();
    updateRecommendation();
  };

  // Initial calculation
  updateCalculator();
  updateRecommendation();
}

// Request detailed quote
function requestDetailedQuote() {
  const data = appState.calculatorData;
  const activeTab = $('.calculator-tab.active')?.getAttribute('data-tab') || 'area';
  const totalCost = $('#estimated-cost')?.textContent || $('#estimated-cost-dimensions')?.textContent || 'غير محدد';

  // Map material to Arabic
  const materialLabels = {
    economy: 'اقتصادي (MDF)',
    standard: 'قياسي (ألومنيوم)',
    premium: 'فاخر (HPL/طبيعي)'
  };

  // Build the message
  let message = `مرحباً الماسية للمطابخ، أرغب في عرض سعر لمطبخي:\n\n`;
  message += `🔹 نوع الحساب: ${activeTab === 'area' ? 'بالمساحة' : 'بالأبعاد'}\n`;

  if (activeTab === 'area') {
    message += `📏 المساحة: ${data.area} م²\n`;
    message += `🗄️ عدد الأدراج/القطع: ${data.drawers}\n`;
  } else {
    message += `📏 الأبعاد: ${data.length} م (طول) × ${data.width} م (عرض)\n`;
    message += `🗄️ الوحدات: ${data.wallCabinets} علوية، ${data.baseCabinets} سفلية\n`;
  }

  message += `💎 الخامات: ${materialLabels[data.material] || data.material}\n`;

  if (data.addons.length > 0) {
    message += `➕ الإضافات: ${data.addons.join('، ')}\n`;
  }

  message += `💰 التكلفة التقديرية: ${totalCost}\n`;

  // Add city if we can find it in the lead form (optional helper)
  const cityInput = document.getElementById('city');
  if (cityInput && cityInput.value) {
    message += `📍 المدينة: ${cityInput.value}\n`;
  }

  const whatsappUrl = `https://wa.me/201092497811?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  trackEvent('calculator', 'quote_request', data.material);
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initCalculator();
});// ==============================
// Form Handling & Validation
// ==============================

// Enhanced contact form handler


// showNotification is now defined in js/main.js to be globally accessible

// Form validation functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^01[0-2|5]{1}[0-9]{8}$/;
  return re.test(phone);
}

// Initialize form handlers
function initFormHandlers() {
  const contactForm = $('#leadForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleForm);
  }

  // Add real-time validation
  const phoneInput = $('#phone');
  if (phoneInput) {
    phoneInput.addEventListener('blur', function () {
      if (this.value && !validatePhone(this.value)) {
        this.style.borderColor = '#f44336';
      } else {
        this.style.borderColor = '';
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initFormHandlers();
});



// ==============================
// Enhanced Form Handling with Image Upload
// ==============================

let uploadedImages = [];

// Initialize enhanced form functionality
function initEnhancedForm() {
  initFileUpload();
  initFormValidation();
  initAutoSave();
}

// File upload functionality
function initFileUpload() {
  const fileInput = document.getElementById('attachment');
  const fileUploadLabel = document.querySelector('.file-upload-label');

  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop functionality
    fileUploadLabel.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileUploadLabel.style.borderColor = 'var(--gold)';
      fileUploadLabel.style.background = 'rgba(212,175,55,0.1)';
    });

    fileUploadLabel.addEventListener('dragleave', () => {
      fileUploadLabel.style.borderColor = 'rgba(212,175,55,0.3)';
      fileUploadLabel.style.background = 'rgba(212,175,55,0.05)';
    });

    fileUploadLabel.addEventListener('drop', (e) => {
      e.preventDefault();
      fileUploadLabel.style.borderColor = 'rgba(212,175,55,0.3)';
      fileUploadLabel.style.background = 'rgba(212,175,55,0.05)';

      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect({ target: fileInput });
      }
    });
  }
}

function handleFileSelect(event) {
  const files = event.target.files;
  const container = document.getElementById('imagePreviewContainer');

  if (!container) {
    const previewContainer = document.createElement('div');
    previewContainer.id = 'imagePreviewContainer';
    previewContainer.className = 'image-preview-container';
    event.target.parentNode.appendChild(previewContainer);
  }

  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const imageData = {
          name: file.name,
          data: e.target.result,
          type: file.type
        };

        uploadedImages.push(imageData);
        createImagePreview(imageData);
        updateFileUploadLabel();
      };

      reader.readAsDataURL(file);
    }
  });
}

function createImagePreview(imageData) {
  const container = document.getElementById('imagePreviewContainer');
  const preview = document.createElement('div');
  preview.className = 'image-preview';

  preview.innerHTML = `
    <img src="${imageData.data}" alt="${imageData.name}">
    <button type="button" class="remove-image" onclick="removeImage('${imageData.name}')">
      <i data-lucide="x"></i>
    </button>
  `;

  container.appendChild(preview);
}

function removeImage(fileName) {
  uploadedImages = uploadedImages.filter(img => img.name !== fileName);
  const container = document.getElementById('imagePreviewContainer');
  if (container) {
    container.innerHTML = '';
    uploadedImages.forEach(createImagePreview);
  }
  updateFileUploadLabel();
}

function updateFileUploadLabel() {
  const label = document.querySelector('.upload-text');
  if (label && uploadedImages.length > 0) {
    label.textContent = `${uploadedImages.length} صورة مرفوعة`;
  } else if (label) {
    label.textContent = 'اختر الصور أو اسحبها هنا';
  }
}

// Enhanced form validation
function initFormValidation() {
  const phoneInput = document.getElementById('phone');

  if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
      let value = e.target.value.replace(/\D/g, '');

      if (value.startsWith('0')) {
        value = '+20' + value.substring(1);
      }

      if (value.startsWith('20')) {
        value = '+' + value;
      }

      e.target.value = value;

      // Real-time validation
      if (value.length > 0 && !validatePhone(value)) {
        e.target.style.borderColor = '#f44336';
      } else {
        e.target.style.borderColor = '';
      }
    });
  }
}

// Auto-save form data
function initAutoSave() {
  const form = document.getElementById('leadForm');
  const inputs = form.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    input.addEventListener('input', debounce(saveFormData, 1000));
    input.addEventListener('change', debounce(saveFormData, 500));
  });

  // Load saved data
  loadFormData();
}

function saveFormData() {
  const formData = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    city: document.getElementById('city').value,
    service: document.getElementById('service').value,
    message: document.getElementById('message').value
  };

  localStorage.setItem('almassia_contact_form', JSON.stringify(formData));
}

function loadFormData() {
  const saved = localStorage.getItem('almassia_contact_form');
  if (saved) {
    const formData = JSON.parse(saved);

    Object.keys(formData).forEach(key => {
      const element = document.getElementById(key);
      if (element && formData[key]) {
        element.value = formData[key];
      }
    });
  }
}

function clearSavedFormData() {
  localStorage.removeItem('almassia_contact_form');
  uploadedImages = [];
  const previewContainer = document.getElementById('imagePreviewContainer');
  if (previewContainer) {
    previewContainer.innerHTML = '';
  }
  updateFileUploadLabel();
}

// Enhanced form handler with image support
async function handleForm(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('.btn-submit');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');

  try {
    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'block';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const name = (formData.get('name') || '').trim();
    const phone = (formData.get('phone') || '').trim();
    const city = (formData.get('city') || '').trim();
    const service = (formData.get('service') || '').trim();
    const message = (formData.get('message') || '').trim();

    // Validation
    if (!name || !phone || !city || !service) {
      throw new Error('الرجاء إدخال جميع الحقول المطلوبة');
    }

    /*if (!validatePhone(phone)) {
      throw new Error('يرجى إدخال رقم هاتف مصري صحيح');
    }*/

    // Create WhatsApp message with images
    let whatsappMessage = `طلب جديد من موقع الماسية للمطابخ:\n\n`;
    whatsappMessage += `الاسم: ${name}\n`;
    whatsappMessage += `الهاتف: ${phone}\n`;
    whatsappMessage += `المدينة: ${city}\n`;
    whatsappMessage += `الخدمة: ${service}\n`;

    if (message) {
      whatsappMessage += `الوصف: ${message}\n`;
    }

    if (uploadedImages.length > 0) {
      whatsappMessage += `\nعدد الصور المرفوعة: ${uploadedImages.length}\n`;
    }

    whatsappMessage += `\nوقت الإرسال: ${new Date().toLocaleString('ar-EG')}`;

    // Encode message for WhatsApp
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/201092497811?text=${encodedMessage}`;

    // Open WhatsApp
    const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;

    // If there are images, show instructions
    if (uploadedImages.length > 0) {
      setTimeout(() => {
        showNotification(`تم إرسال النص! يرجى إرسال ${uploadedImages.length} صورة يدويًا على واتساب`, 'info', 8000);
      }, 1000);
    }

    // Reset form
    form.reset();
    clearSavedFormData();

    // Track successful submission
    trackEvent('contact', 'form_submit_success', service);

    showNotification('تم إرسال طلبك بنجاح! سيتم التواصل معك خلال 24 ساعة.', 'success');

  } catch (error) {
    console.error('Form handling error:', error);
    showNotification(error.message, 'error');
    trackEvent('contact', 'form_submit_error', error.message);
  } finally {
    // Reset button state
    btnText.style.display = 'block';
    btnLoading.style.display = 'none';
    submitBtn.disabled = false;
  }

  return false;
}

// Update form handlers initialization
function initFormHandlers() {
  const contactForm = $('#leadForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleForm);
    contactForm.addEventListener('reset', clearSavedFormData);
  }

  initEnhancedForm();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initFormHandlers();
});