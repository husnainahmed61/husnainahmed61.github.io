/*!
 * Husnain Ahmed — Portfolio
 * Nav behaviour: mobile menu toggle + scroll-spy active link highlighting.
 * Self-contained (no Bootstrap dependency).
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('mobileMenu');

    /* ---- Mobile menu toggle ---- */
    if (toggle && menu) {
      var closeMenu = function () {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      };

      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      // Close on link click
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });

      // Close when clicking outside
      document.addEventListener('click', function (e) {
        if (menu.classList.contains('open') &&
            !menu.contains(e.target) && !toggle.contains(e.target)) {
          closeMenu();
        }
      });

      // Close on Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
    }

    /* ---- Scroll-spy: highlight the nav link of the section in view ---- */
    var sections = Array.prototype.slice.call(document.querySelectorAll('section[id], header[id]'));
    var navLinks = Array.prototype.slice.call(
      document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]')
    );

    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
      var setActive = function (id) {
        navLinks.forEach(function (link) {
          var match = link.getAttribute('href') === '#' + id;
          link.classList.toggle('active', match);
        });
      };

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, {
        rootMargin: '-45% 0px -50% 0px',
        threshold: 0
      });

      sections.forEach(function (section) { observer.observe(section); });
    }
  });
})();
