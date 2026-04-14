/* ==========================================================================
   Portfolio — Vanilla JS (no dependencies)
   1. Nav: scroll state, mobile toggle, active link tracking
   2. Scroll to top
   3. Reveal on scroll (IntersectionObserver)
   4. Contact form — AJAX submission via FormSubmit
   ========================================================================== */

(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- 1. Header scroll + scroll-top button ----------
    var header = document.getElementById('site-header');
    var scrollTopBtn = document.getElementById('scroll-top');

    function onScroll() {
        var y = window.scrollY || window.pageYOffset;
        if (header) {
            header.classList.toggle('scrolled', y > 12);
        }
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', y > 600);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    }

    // ---------- 2. Mobile nav toggle ----------
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            toggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
        });

        // Close menu when a link is tapped
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Ouvrir le menu');
            });
        });

        // Close on Escape
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }

    // ---------- 3. Active nav link tracking ----------
    var sections = document.querySelectorAll('main section[id]');
    var navLinks = document.querySelectorAll('.primary-nav a');

    if ('IntersectionObserver' in window && sections.length && navLinks.length) {
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    navLinks.forEach(function (link) {
                        var target = link.getAttribute('href');
                        link.classList.toggle('active', target === '#' + id);
                    });
                }
            });
        }, {
            rootMargin: '-40% 0px -55% 0px',
            threshold: 0
        });

        sections.forEach(function (section) {
            navObserver.observe(section);
        });
    }

    // ---------- 4. Reveal on scroll ----------
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        var revealables = document.querySelectorAll(
            '.section-head, .about-grid, .timeline-item, .edu-card, .skill-group, .project-card, .logo-card, .contact-grid'
        );

        revealables.forEach(function (el) {
            el.classList.add('reveal');
        });

        var revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealables.forEach(function (el) {
            revealObserver.observe(el);
        });
    }

    // ---------- 5. Contact form — AJAX submission ----------
    var form = document.getElementById('contact-form');

    if (form) {
        var status = form.querySelector('.form-status');
        var submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            if (status) status.textContent = 'Envoi en cours…';
            if (submitBtn) submitBtn.disabled = true;

            var data = new FormData(form);
            var action = form.action.indexOf('/ajax/') !== -1
                ? form.action
                : form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');

            fetch(action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: data
            })
                .then(function (response) {
                    if (!response.ok) throw new Error('bad-response');
                    return response.json().catch(function () { return {}; });
                })
                .then(function () {
                    form.reset();
                    if (status) status.textContent = 'Merci ! Votre message a bien été envoyé.';
                })
                .catch(function (error) {
                    if (status) {
                        status.textContent = 'Envoi impossible pour le moment. Contactez-moi directement : ismael.zerroukpro@gmail.com';
                    }
                    console.error('Form submission error:', error);
                })
                .finally(function () {
                    if (submitBtn) submitBtn.disabled = false;
                });
        });
    }
})();
