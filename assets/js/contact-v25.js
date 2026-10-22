/* Contact-only UX and integration safeguards; no shared files modified. */
(() => {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const cfg = window.NOVAIRE_CONFIG || {};
        const form = document.getElementById('enquiry-form');
        const fb = document.querySelector('[data-form-feedback]');
        const goodURL = v => { try {
            const u = new URL(v);
            return ['https:', 'http:'].includes(u.protocol) && !!u.hostname.includes('.');
        }
        catch {
            return false;
        } };
        // Render four social icons via main.js even while official URLs remain unconfigured.
        // Icons without configured URLs are non-clickable; do not invent profiles.
        // Optional official privacy policy URL, configured by the client at launch.
        if (goodURL(cfg.privacyPolicyUrl)) {
            const label = form?.querySelector('.form-consent .contact-privacy-hint');
            if (label) {
                const link = document.createElement('a');
                link.href = cfg.privacyPolicyUrl;
                link.textContent = 'Read our privacy policy';
                link.className = 'contact-privacy-link';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                label.append(' ', link);
            }
        }
        form?.addEventListener('submit', e => {
            const trap = form.querySelector('input[name="website"]');
            if (trap?.value.trim()) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (fb) {
                    fb.textContent = 'This enquiry could not be submitted.';
                    fb.dataset.state = 'error';
                }
                return;
            }
            if (fb)
                fb.dataset.state = '';
        }, true);
        form?.addEventListener('input', () => { if (fb && fb.dataset.state === 'error') {
            fb.textContent = '';
            fb.dataset.state = '';
        } });
        // Main.js owns delivery, with honest configuration and error handling.
        // There is deliberately no mocked success response without a real endpoint.
    });
})();
