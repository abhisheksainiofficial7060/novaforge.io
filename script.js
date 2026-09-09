/* ==========================================================================
   NovaForge — script.js
   Vanilla JS only. No dependencies, no backend.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Footer year                                                        */
  /* ------------------------------------------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ */
  /* Sticky header shadow/background once user scrolls                  */
  /* ------------------------------------------------------------------ */
  var header = document.getElementById('site-header');
  var lastScrollState = false;

  function updateHeaderState() {
    var shouldBeScrolled = window.scrollY > 8;
    if (shouldBeScrolled !== lastScrollState) {
      header.classList.toggle('scrolled', shouldBeScrolled);
      lastScrollState = shouldBeScrolled;
    }
  }
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  /* ------------------------------------------------------------------ */
  /* Mobile hamburger menu                                              */
  /* ------------------------------------------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  function closeMenu() {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close the mobile menu after a link is chosen
  var navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ------------------------------------------------------------------ */
  /* Smooth scrolling for in-page anchor links                          */
  /* (native CSS `scroll-behavior: smooth` already handles this, but    */
  /* we also account for the sticky header height so headings aren't    */
  /* hidden underneath it.)                                             */
  /* ------------------------------------------------------------------ */
  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href');
      if (targetId.length < 2) return; // guard against bare "#"
      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      var headerHeight = header.offsetHeight;
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 1;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Move focus for accessibility once the scroll settles
      window.setTimeout(function () {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }, 500);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Active nav link while scrolling (IntersectionObserver)             */
  /* ------------------------------------------------------------------ */
  var sections = ['home', 'about', 'services', 'projects', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  var navLinkMap = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').replace('#', '');
    navLinkMap[id] = link;
  });

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          if (navLinkMap[id]) navLinkMap[id].classList.add('active');
        }
      });
    }, {
      rootMargin: '-40% 0px -55% 0px', // trigger when section is roughly centered
      threshold: 0
    });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal animations                                           */
  /* ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback: show everything immediately
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------ */
  /* Animated statistic counters                                        */
  /* ------------------------------------------------------------------ */
  var statNumbers = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1500; // ms
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic for a natural deceleration
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = current + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && statNumbers.length) {
    var statsObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(function (el) { statsObserver.observe(el); });
  } else {
    statNumbers.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      el.textContent = target + (el.getAttribute('data-suffix') || '');
    });
  }

  /* ------------------------------------------------------------------ */
  /* Back-to-top button                                                  */
  /* ------------------------------------------------------------------ */
  var backToTop = document.getElementById('backToTop');

  function updateBackToTop() {
    backToTop.classList.toggle('visible', window.scrollY > 480);
  }
  updateBackToTop();
  window.addEventListener('scroll', updateBackToTop, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ------------------------------------------------------------------ */
  /* Contact form validation (client-side only, no backend)             */
  /* ------------------------------------------------------------------ */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');

  var fields = {
    name: {
      input: document.getElementById('name'),
      error: document.getElementById('nameError'),
      validate: function (value) {
        return value.trim().length >= 2 ? '' : 'Please enter your name (2+ characters).';
      }
    },
    email: {
      input: document.getElementById('email'),
      error: document.getElementById('emailError'),
      validate: function (value) {
        var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(value.trim()) ? '' : 'Please enter a valid email address.';
      }
    },
    message: {
      input: document.getElementById('message'),
      error: document.getElementById('messageError'),
      validate: function (value) {
        return value.trim().length >= 10 ? '' : 'Message should be at least 10 characters.';
      }
    }
  };

  function validateField(key) {
    var field = fields[key];
    var errorMessage = field.validate(field.input.value);
    field.error.textContent = errorMessage;
    field.input.classList.toggle('invalid', Boolean(errorMessage));
    field.input.setAttribute('aria-invalid', errorMessage ? 'true' : 'false');
    return errorMessage === '';
  }

  // Validate on blur for immediate, non-intrusive feedback
  Object.keys(fields).forEach(function (key) {
    fields[key].input.addEventListener('blur', function () {
      validateField(key);
    });
    // Clear error as soon as the user starts correcting it
    fields[key].input.addEventListener('input', function () {
      if (fields[key].input.classList.contains('invalid')) {
        validateField(key);
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var isValid = Object.keys(fields).every(function (key) {
      return validateField(key);
    });

    if (!isValid) {
      status.textContent = 'Please fix the highlighted fields and try again.';
      status.className = 'form-status error';
      return;
    }

    // No backend: simulate a successful submission.
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    window.setTimeout(function () {
      status.textContent = 'Thanks — your message has been received. We\'ll be in touch within one business day.';
      status.className = 'form-status success';
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }, 700);
  });

})();
