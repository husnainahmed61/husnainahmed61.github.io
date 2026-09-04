/*!
 * Husnain Ahmed — Portfolio
 * Terminal/IDE chrome: mobile menu, scroll-spy, command palette (Cmd/Ctrl+K), local clock.
 * Self-contained. No dependencies.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Mobile menu
       ------------------------------------------------------------------ */
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('mobileMenu');

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

      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });

      document.addEventListener('click', function (e) {
        if (menu.classList.contains('open') &&
            !menu.contains(e.target) && !toggle.contains(e.target)) {
          closeMenu();
        }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
      });
    }

    /* ------------------------------------------------------------------
       Scroll-spy — highlights the rail + mobile menu entry in view
       ------------------------------------------------------------------ */
    var sections = Array.prototype.slice.call(
      document.querySelectorAll('section[id], header[id]')
    );
    var navLinks = Array.prototype.slice.call(
      document.querySelectorAll('.rail-nav a[href^="#"], .mobile-menu a[href^="#"]')
    );

    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
      var setActive = function (id) {
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      };

      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

      sections.forEach(function (section) { spy.observe(section); });
    }

    /* ------------------------------------------------------------------
       Local clock (Europe/Rome) in the status bar
       ------------------------------------------------------------------ */
    var clock = document.getElementById('localClock');
    if (clock) {
      var fmt;
      try {
        fmt = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Rome',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
      } catch (err) {
        fmt = null;
      }
      var tick = function () {
        var now = new Date();
        clock.textContent = fmt ? fmt.format(now) : now.toTimeString().slice(0, 8);
      };
      tick();
      setInterval(tick, 1000);
    }

    /* ------------------------------------------------------------------
       Command palette
       ------------------------------------------------------------------ */
    var palette = document.getElementById('palette');
    var input = document.getElementById('paletteInput');
    var list = document.getElementById('paletteList');

    if (!palette || !input || !list) return;

    var go = function (href, external) {
      if (external) {
        window.open(href, '_blank', 'noopener');
      } else {
        window.location.hash = href;
      }
    };

    var COMMANDS = [
      { label: 'About',             kind: 'goto',   keys: 'about whoami intro home top',        run: function () { go('#about'); } },
      { label: 'Skills',            kind: 'goto',   keys: 'skills stack tech languages tools',  run: function () { go('#skills'); } },
      { label: 'Experience',        kind: 'goto',   keys: 'experience work jobs history career',run: function () { go('#experience'); } },
      { label: 'Personal Projects', kind: 'goto',   keys: 'projects side apps portfolio',       run: function () { go('#projects'); } },
      { label: 'Education',         kind: 'goto',   keys: 'education degree university msc',    run: function () { go('#education'); } },
      { label: 'Interests',         kind: 'goto',   keys: 'interests hobbies chess gaming',     run: function () { go('#interests'); } },
      { label: 'Publications',      kind: 'goto',   keys: 'publications research paper',        run: function () { go('#awards'); } },
      { label: 'Contact',           kind: 'goto',   keys: 'contact hire email reach phone',     run: function () { go('#contact'); } },

      { label: 'Download resume (PDF)', kind: 'action', keys: 'download resume cv pdf', run: function () {
          window.open('assets/pdf/Resume-Husnain.pdf', '_blank', 'noopener');
        } },
      { label: 'Send an email',     kind: 'action', keys: 'email mail contact write hire', run: function () {
          window.location.href = 'mailto:husnainahmed61@gmail.com';
        } },
      { label: 'Copy email address', kind: 'action', keys: 'copy email clipboard', run: function (item) {
          var addr = 'husnainahmed61@gmail.com';
          var done = function () {
            var original = item.label;
            item.label = 'Copied: ' + addr;
            render(input.value);
            setTimeout(function () { item.label = original; }, 1600);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(addr).then(done).catch(function () {});
          }
          return true; // keep the palette open so the confirmation is visible
        } },
      { label: 'Open GitHub',       kind: 'link',   keys: 'github code repos source', run: function () {
          go('https://github.com/husnainahmed61', true);
        } },
      { label: 'Open LinkedIn',     kind: 'link',   keys: 'linkedin profile network', run: function () {
          go('https://www.linkedin.com/in/husnain-ahmed-dev/', true);
        } },
      { label: 'Toggle language (EN / IT)', kind: 'action', keys: 'language lingua italiano english translate', run: function () {
          var lt = document.getElementById('langToggle') || document.getElementById('langToggleMobile');
          if (lt) lt.click();
        } }
    ];

    var results = [];
    var cursor = 0;
    var lastFocus = null;

    var render = function (query) {
      var q = (query || '').trim().toLowerCase();
      results = COMMANDS.filter(function (c) {
        if (!q) return true;
        return (c.label + ' ' + c.keys).toLowerCase().indexOf(q) !== -1;
      });

      if (cursor >= results.length) cursor = 0;
      list.innerHTML = '';

      if (!results.length) {
        var empty = document.createElement('li');
        empty.className = 'pl-empty';
        empty.textContent = 'no matches';
        list.appendChild(empty);
        return;
      }

      results.forEach(function (item, i) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', i === cursor ? 'true' : 'false');
        li.id = 'palette-opt-' + i;

        var label = document.createElement('span');
        label.textContent = item.label;

        var kind = document.createElement('span');
        kind.className = 'pl-kind';
        kind.textContent = item.kind;

        li.appendChild(label);
        li.appendChild(kind);

        li.addEventListener('mouseenter', function () {
          cursor = i;
          syncSelection();
        });
        li.addEventListener('click', function () { exec(item); });

        list.appendChild(li);
      });

      syncSelection();
    };

    var syncSelection = function () {
      var options = list.querySelectorAll('li[role="option"]');
      options.forEach(function (li, i) {
        li.setAttribute('aria-selected', i === cursor ? 'true' : 'false');
      });
      var active = options[cursor];
      if (active) {
        input.setAttribute('aria-activedescendant', active.id);
        active.scrollIntoView({ block: 'nearest' });
      }
    };

    var exec = function (item) {
      var keepOpen = item.run(item);
      if (!keepOpen) close();
    };

    var open = function () {
      lastFocus = document.activeElement;
      palette.classList.add('open');
      input.value = '';
      cursor = 0;
      render('');
      input.focus();
    };

    var close = function () {
      palette.classList.remove('open');
      input.removeAttribute('aria-activedescendant');
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };

    var isOpen = function () { return palette.classList.contains('open'); };

    ['paletteOpen', 'paletteOpenMobile'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', open);
    });

    // Global shortcut: Cmd/Ctrl + K, plus "/" as a shorthand
    document.addEventListener('keydown', function (e) {
      var mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        isOpen() ? close() : open();
        return;
      }
      if (e.key === '/' && !isOpen()) {
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
        e.preventDefault();
        open();
      }
    });

    input.addEventListener('input', function () {
      cursor = 0;
      render(input.value);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (results.length) { cursor = (cursor + 1) % results.length; syncSelection(); }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (results.length) { cursor = (cursor - 1 + results.length) % results.length; syncSelection(); }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[cursor]) exec(results[cursor]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'Tab') {
        // keep focus inside the dialog
        e.preventDefault();
      }
    });

    // Click on the backdrop closes
    palette.addEventListener('mousedown', function (e) {
      if (e.target === palette) close();
    });
  });
})();
