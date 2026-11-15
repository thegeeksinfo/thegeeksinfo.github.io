// BEZ CRAFT — site behaviour
(function () {
    'use strict';

    // Mobile navigation
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('site-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Highlight the nav link of the section in view
    var links = document.querySelectorAll('.site-nav > a[href^="#"]:not(.btn)');
    if ('IntersectionObserver' in window && links.length) {
        var byId = {};
        links.forEach(function (l) { byId[l.getAttribute('href').slice(1)] = l; });
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && byId[entry.target.id]) {
                    links.forEach(function (l) { l.classList.remove('active'); });
                    byId[entry.target.id].classList.add('active');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(byId).forEach(function (id) {
            var s = document.getElementById(id);
            if (s) io.observe(s);
        });
    }

    // Contact form: validate, then open the visitor's email client
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var missing = [];
            form.querySelectorAll('[required]').forEach(function (el) {
                var bad = !el.value.trim() || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value));
                el.classList.toggle('invalid', bad);
                if (bad) missing.push(el);
            });
            if (missing.length) {
                status.className = 'form-status error';
                status.textContent = 'Please complete the highlighted fields.';
                missing[0].focus();
                return;
            }
            var d = new FormData(form);
            var subject = 'Enquiry: ' + d.get('service') + ' — ' + d.get('name');
            var body = 'Name: ' + d.get('name') +
                '\nOrganisation: ' + (d.get('organisation') || '-') +
                '\nEmail: ' + d.get('email') +
                '\nArea of interest: ' + d.get('service') +
                '\n\n' + d.get('message');
            window.location.href = 'mailto:thegeeksinformation@gmail.com?subject=' +
                encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
            status.className = 'form-status ok';
            status.textContent = 'Your email app has opened with the enquiry. Send it from there, or call +256 770 688 802.';
        });
    }

    // Progressive Web App: service worker + install button
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js').catch(function () {});
        });
    }
    var installBtn = document.getElementById('install-app');
    var deferred = null;
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferred = e;
        if (installBtn) installBtn.hidden = false;
    });
    if (installBtn) {
        installBtn.addEventListener('click', function () {
            if (!deferred) return;
            deferred.prompt();
            deferred.userChoice.finally(function () {
                deferred = null;
                installBtn.hidden = true;
            });
        });
    }
    window.addEventListener('appinstalled', function () {
        if (installBtn) installBtn.hidden = true;
    });
})();
