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

    // ---------- 5. Scroll progress bar ----------
    var progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        var updateProgress = function () {
            var scroll = window.scrollY || window.pageYOffset;
            var height = document.documentElement.scrollHeight - window.innerHeight;
            var ratio = height > 0 ? scroll / height : 0;
            progressBar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);
        updateProgress();
    }

    // ---------- 6. Typewriter effect ----------
    var typewriters = document.querySelectorAll('.typewriter');
    typewriters.forEach(function (el) {
        var raw = el.getAttribute('data-words');
        var words = [];
        if (raw) {
            try {
                words = JSON.parse(raw);
            } catch (e) {
                // Fallback: comma-separated values
                words = raw.replace(/^\s*\[|\]\s*$/g, '').split(',').map(function (s) {
                    return s.trim().replace(/^["']+|["']+$/g, '');
                }).filter(Boolean);
            }
        }
        if (!Array.isArray(words) || !words.length) return;

        // Reduced motion: cycle words without typing
        if (prefersReducedMotion) {
            var idx = 0;
            el.textContent = words[0];
            setInterval(function () {
                idx = (idx + 1) % words.length;
                el.textContent = words[idx];
            }, 3200);
            return;
        }

        // Typing loop
        var wordIndex = 0;
        var charIndex = 0;
        var deleting = false;
        el.textContent = '';

        var tick = function () {
            var current = words[wordIndex];
            if (!deleting) {
                charIndex++;
                el.textContent = current.slice(0, charIndex);
                if (charIndex === current.length) {
                    deleting = true;
                    setTimeout(tick, 1800);
                    return;
                }
            } else {
                charIndex--;
                el.textContent = current.slice(0, charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                }
            }
            setTimeout(tick, deleting ? 45 : 95);
        };

        setTimeout(tick, 700);
    });

    // ---------- 7. Spotlight cursor-follow ----------
    var spotlightEls = document.querySelectorAll('.spotlight');
    if (spotlightEls.length && window.matchMedia('(hover: hover)').matches) {
        spotlightEls.forEach(function (el) {
            el.addEventListener('pointermove', function (event) {
                var rect = el.getBoundingClientRect();
                var x = ((event.clientX - rect.left) / rect.width) * 100;
                var y = ((event.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty('--mx', x + '%');
                el.style.setProperty('--my', y + '%');
            });
        });
    }

    // ---------- 8. Hero blob parallax (mouse) ----------
    var heroBlobs = document.querySelectorAll('.hero .blob');
    if (heroBlobs.length && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
        var hero = document.getElementById('hero');
        if (hero) {
            hero.addEventListener('pointermove', function (event) {
                var rect = hero.getBoundingClientRect();
                var cx = (event.clientX - rect.left) / rect.width - 0.5;
                var cy = (event.clientY - rect.top) / rect.height - 0.5;
                heroBlobs.forEach(function (blob, i) {
                    var factor = i === 0 ? 50 : -50;
                    blob.style.transform = 'translate(' + (cx * factor) + 'px, ' + (cy * factor) + 'px)';
                });
            });
            hero.addEventListener('pointerleave', function () {
                heroBlobs.forEach(function (blob) {
                    blob.style.transform = '';
                });
            });
        }
    }

    // ---------- 9. Stagger --i for reveals within grids ----------
    var staggerContainers = [
        '.projects-grid .project-card',
        '.education-grid .edu-card',
        '.skills-grid .skill-group',
        '.logos-grid .logo-card',
        '.timeline .timeline-item'
    ];
    staggerContainers.forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (el, i) {
            el.style.setProperty('--i', i);
        });
    });

    // ---------- 10. Contact form — AJAX submission ----------
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
