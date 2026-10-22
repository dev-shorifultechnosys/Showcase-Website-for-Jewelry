/* NOVAIRE shared interactive behaviours (ES6+, framework-free).
 * Header/mobile navigation and footer social profiles are IDENTICAL on all four pages.
 * Backend handoff: approved integrations are configured in assets/js/catalogue.js.
 * No implicit form success or invented external checkout profiles.
 */
(() => {
    'use strict';
    const config = window.NOVAIRE_CONFIG || {};
    const products = window.NOVAIRE_PRODUCTS || [];
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const isHttpUrl = s => { try {
        const u = new URL(s);
        return ['https:', 'http:'].includes(u.protocol) && u.hostname.includes('.');
    }
    catch {
        return false;
    } };
    const icon = (name, size = 18) => {
        const paths = {
            arrow: '<path d="M4 12h16m-7-7 7 7-7 7"/>',
            diagonal: '<path d="M7 17 18 6M8 6h10v10"/>',
            close: '<path d="M5 5 19 19M19 5 5 19"/>',
            plus: '<path d="M12 4v16M4 12h16"/>',
            pause: '<path d="M8 5v14M16 5v14"/>',
            play: '<path d="m8 5 11 7-11 7z"/>',
            chevronLeft: '<path d="m14 5-7 7 7 7"/>',
            chevronRight: '<path d="m10 5 7 7-7 7"/>',
            expand: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5m13-5v5h-5"/>',
            instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".9" fill="currentColor" stroke="none"/>',
            pinterest: '<circle cx="12" cy="12" r="9"/><path d="m9 21 2-8m-.6 1.5a5 5 0 1 1 4 2"/>',
            facebook: '<path d="M16 3h-3a4 4 0 0 0-4 4v14m-4-9h12"/>',
            youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>',
        };
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.diagonal}</svg>`;
    };
    function announce(msg) {
        let el = document.querySelector('#site-status');
        if (!el) {
            el = document.createElement('div');
            el.id = 'site-status';
            el.className = 'site-status';
            el.role = 'status';
            el.setAttribute('aria-live', 'polite');
            document.body.append(el);
        }
        el.innerHTML = esc(msg);
        el.classList.add('visible');
        clearTimeout(window.__statusT);
        window.__statusT = setTimeout(() => el.classList.remove('visible'), 4700);
    }
    function common() {
        const menuBtn = document.querySelector('[data-menu-toggle]');
        const nav = document.querySelector('[data-mobile-nav]');
        menuBtn?.addEventListener('click', () => { let open = menuBtn.getAttribute('aria-expanded') !== 'true'; menuBtn.setAttribute('aria-expanded', String(open)); nav?.classList.toggle('active', open); document.body.classList.toggle('menu-open', open); });
        nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menuBtn?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('active'); document.body.classList.remove('menu-open'); }));
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav?.classList.contains('active')) {
            menuBtn?.click();
            menuBtn?.focus();
        } });
        const current = (location.pathname.split('/').pop() || 'index.html');
        document.querySelectorAll('.site-nav__links a,.site-nav__mobile a').forEach(a => { let target = a.getAttribute('href') || ''; if (target.split('#')[0] === current) {
            a.classList.add('current');
            a.setAttribute('aria-current', 'page');
        } });
        const footer = document.querySelector('[data-socials]');
        const contact = document.querySelector('[data-contact-socials]');
        function addSocials(el) {
            if (!el)
                return;
            let container = document.createElement('div');
            container.className = 'social-icons';
            const names = ['instagram', 'pinterest', 'facebook', 'youtube'];
            names.forEach(n => {
                let link = config.socials?.[n] || '';
                let valid = isHttpUrl(link);
                let x = document.createElement(valid ? 'a' : 'span');
                x.className = 'social-icon' + (valid ? '' : ' is-demo');
                x.setAttribute('aria-label', valid ? `Visit our ${n}` : `${n} profile pending`);
                x.title = valid ? `${n} — official profile` : `${n} — awaiting official profile`;
                if (valid) {
                    x.href = link;
                    x.rel = 'noopener noreferrer';
                    x.target = '_blank';
                }
                x.innerHTML = icon(n, 18);
                container.append(x);
            });
            el.replaceChildren(container);
        }
        addSocials(footer);
        addSocials(contact);
    }
    function media() {
        const video = document.querySelector('[data-hero-video]');
        const control = document.querySelector('[data-video-toggle]');
        if (video) {
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
            const initial = () => { if (reduce.matches) {
                video.pause();
                video.removeAttribute('autoplay');
                if (control) {
                    control.innerHTML = icon('play', 18) + '<span>Play film</span>';
                    control.setAttribute('aria-label', 'Play hero film');
                }
            }
            else
                video.play().catch(() => { if (control) {
                    control.innerHTML = icon('play', 18) + '<span>Play film</span>';
                    control.setAttribute('aria-label', 'Play hero film');
                } }); };
            initial();
            control?.addEventListener('click', () => { if (video.paused) {
                video.play().catch(() => announce('Video playback is unavailable in this browser.'));
                control.innerHTML = icon('pause', 18) + '<span>Pause film</span>';
                control.setAttribute('aria-label', 'Pause hero film');
            }
            else {
                video.pause();
                control.innerHTML = icon('play', 18) + '<span>Play film</span>';
                control.setAttribute('aria-label', 'Play hero film');
            } });
            reduce.addEventListener?.('change', () => { if (reduce.matches) {
                video.pause();
                if (control)
                    control.innerHTML = icon('play', 18) + '<span>Play film</span>';
            } });
        }
        const craft = document.querySelector('[data-craft-video]');
        if (craft) {
            const url = config.craftsmanshipVideo;
            if (url) {
                craft.src = url;
                craft.load();
            }
            craft.addEventListener('error', () => { document.querySelector('.craft-video-note')?.classList.add('error'); });
        }
    }
    function productMarkup(p) { return `<article class="product-card reveal"><button class="product-image" type="button" data-view="${esc(p.id)}" aria-label="View photos of ${esc(p.name)}"><img src="${esc(p.image)}" alt="Photograph illustrating ${esc(p.name)} in the ${esc(p.category)} collection" loading="lazy" width="1000" height="1100"><span class="image-hover">VIEW OBJECT ${icon('diagonal', 16)}</span></button><div class="product-meta"><span>${esc(p.tag)}</span><button type="button" class="view-icon" data-view="${esc(p.id)}" aria-label="Zoom ${esc(p.name)}">${icon('expand', 16)}</button></div><div class="product-heading"><h3>${esc(p.name)}</h3><span>${esc(p.material)}</span></div><p class="product-caption">${esc(p.subtitle)}</p><div class="product-footer"><button type="button" data-view="${esc(p.id)}">DETAILS & ZOOM ${icon('diagonal', 13)}</button><button type="button" data-buy="${esc(p.id)}">BUY NOW ${icon('diagonal', 13)}</button></div></article>`; }
    function productsUI() {
        document.querySelectorAll('[data-product-category]').forEach(el => { let cat = el.dataset.productCategory; el.innerHTML = products.filter(p => p.category === cat).map(productMarkup).join(''); });
        document.querySelectorAll('[data-featured-products]').forEach(el => { el.innerHTML = [products[0], products[3], products[6]].filter(Boolean).map(productMarkup).join(''); });
        if (!document.querySelector('[data-product-category],[data-featured-products]'))
            return;
        let modal = document.getElementById('product-dialog');
        if (!modal)
            return;
        let selected = null, idx = 0, zoomed = false, lastFocus = null;
        const modalImg = modal.querySelector('[data-modal-image]');
        const count = modal.querySelector('[data-modal-count]');
        const title = modal.querySelector('[data-modal-title]');
        const sub = modal.querySelector('[data-modal-description]');
        const thumbs = modal.querySelector('[data-modal-thumbs]');
        const buy = modal.querySelector('[data-modal-buy]');
        const redraw = () => { if (!selected)
            return; let images = selected.images?.length ? selected.images : [selected.image]; idx = (idx + images.length) % images.length; modalImg.src = images[idx]; modalImg.alt = `${selected.name}: photographic close-up view ${idx + 1} of ${images.length}`; modalImg.classList.remove('zoomed'); zoomed = false; count.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`; title.textContent = selected.name; sub.textContent = selected.subtitle + ' · ' + selected.material; thumbs.innerHTML = images.map((u, i) => `<button type="button" class="thumb ${i === idx ? 'active' : ''}" data-thumb="${i}" aria-label="Show view ${i + 1}"><img src="${esc(u)}" alt="" width="100" height="110"></button>`).join(''); buy.dataset.buy = selected.id; };
        const open = (id) => { selected = products.find(p => p.id === id); if (!selected)
            return; idx = 0; lastFocus = document.activeElement; redraw(); document.body.classList.add('modal-open'); modal.hidden = false; modal.querySelector('[data-modal-close]')?.focus(); };
        const close = () => { modal.hidden = true; document.body.classList.remove('modal-open'); selected = null; lastFocus?.focus(); };
        modal.querySelector('[data-modal-close]')?.addEventListener('click', close);
        modal.querySelector('[data-modal-prev]')?.addEventListener('click', () => { idx--; redraw(); });
        modal.querySelector('[data-modal-next]')?.addEventListener('click', () => { idx++; redraw(); });
        modal.addEventListener('click', e => { if (e.target === modal)
            close(); let t = e.target.closest('[data-thumb]'); if (t) {
            idx = Number(t.dataset.thumb);
            redraw();
        } });
        modalImg.addEventListener('click', () => { zoomed = !zoomed; modalImg.classList.toggle('zoomed', zoomed); });
        document.addEventListener('keydown', e => { if (modal.hidden)
            return; if (e.key === 'Escape') {
            close();
            return;
        } if (e.key === 'ArrowLeft') {
            idx--;
            redraw();
        } if (e.key === 'ArrowRight') {
            idx++;
            redraw();
        } if (e.key === 'Tab') {
            const foc = [...modal.querySelectorAll('button:not([disabled]),a[href]')].filter(x => x.offsetParent !== null);
            if (!foc.length)
                return;
            let f = foc[0], l = foc.at(-1);
            if (e.shiftKey && document.activeElement === f) {
                e.preventDefault();
                l.focus();
            }
            else if (!e.shiftKey && document.activeElement === l) {
                e.preventDefault();
                f.focus();
            }
        } });
        document.addEventListener('click', e => { let v = e.target.closest('[data-view]'); if (v)
            open(v.dataset.view); let b = e.target.closest('[data-buy]'); if (b)
            buyProduct(b.dataset.buy); });
        const requestedItem = new URLSearchParams(window.location.search).get('item');
        if (requestedItem && products.some(p => p.id === requestedItem)) {
            window.requestAnimationFrame(() => open(requestedItem));
        }
    }
    function craftsmanshipSlideshow() {
        const host = document.querySelector('[data-craft-slideshow]');
        if (!host)
            return;
        const container = host.closest('.craft-editorial-image');
        const slides = [...host.querySelectorAll('[data-craft-slide]')];
        const titles = ['The setting', 'The movement', 'The stitch', 'The finishing touch'];
        const title = container.querySelector('[data-craft-title]'), counter = container.querySelector('[data-craft-count]');
        const prev = container.querySelector('[data-craft-prev]'), next = container.querySelector('[data-craft-next]'), toggle = container.querySelector('[data-craft-toggle]');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
        let index = 0, timer = null, userPaused = reduce.matches, visible = false;
        const preload = (i) => { const img = slides[(i + slides.length) % slides.length].querySelector('img'); if (img) {
            img.loading = 'eager';
            img.decode?.().catch(() => { });
        } };
        const switchTo = (i) => { index = (i + slides.length) % slides.length; preload(index); preload(index + 1); slides.forEach((el, n) => { const active = n === index; el.classList.toggle('is-active', active); el.setAttribute('aria-hidden', String(!active)); }); title.textContent = titles[index]; counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0'); };
        const stop = () => { if (timer !== null) {
            clearInterval(timer);
            timer = null;
        } };
        const play = () => { stop(); if (!userPaused && visible && !document.hidden && !reduce.matches) {
            timer = setInterval(() => switchTo(index + 1), 4900);
        } };
        const updateButton = () => { toggle.textContent = userPaused ? '▶' : 'Ⅱ'; toggle.setAttribute('aria-label', userPaused ? 'Play image slideshow' : 'Pause image slideshow'); toggle.setAttribute('aria-pressed', String(!userPaused)); };
        prev?.addEventListener('click', () => { switchTo(index - 1); play(); });
        next?.addEventListener('click', () => { switchTo(index + 1); play(); });
        toggle?.addEventListener('click', () => { userPaused = !userPaused; updateButton(); play(); });
        const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; play(); }, { threshold: .15 });
        observer.observe(container);
        document.addEventListener('visibilitychange', play);
        reduce.addEventListener?.('change', () => { if (reduce.matches)
            userPaused = true; updateButton(); play(); });
        container.addEventListener('mouseenter', stop);
        container.addEventListener('mouseleave', play);
        container.addEventListener('focusin', stop);
        container.addEventListener('focusout', () => setTimeout(() => { if (!container.contains(document.activeElement))
            play(); }, 0));
        switchTo(0);
        updateButton();
    }
    function heroTitleAnimation() {
        const heading = document.querySelector('[data-hero-title]');
        if (!heading)
            return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const raw = heading.getAttribute('data-hero-title') || heading.textContent.trim();
        const [line1 = 'For everything', line2 = 'worth keeping.'] = raw.split(/\s(?=worth keeping\.?$)/i);
        const buildLine = (text, cls, accent, lineDelay = 0) => {
            const line = document.createElement('span');
            line.className = cls;
            text.split(' ').forEach((word, wi) => {
                const wordWrap = document.createElement('span');
                wordWrap.className = 'hero-word';
                [...word].forEach((char, ci) => {
                    const span = document.createElement('span');
                    span.className = 'hero-char';
                    span.textContent = char;
                    span.classList.add('hero-char--' + Math.round((lineDelay + (wi * 0.23) + (ci * 0.031)) * 1000));
                    wordWrap.appendChild(span);
                });
                line.appendChild(wordWrap);
                if (wi < text.split(' ').length - 1)
                    line.appendChild(document.createTextNode(' '));
            });
            if (accent) {
                const em = document.createElement('em');
                while (line.firstChild)
                    em.appendChild(line.firstChild);
                line.appendChild(em);
            }
            return line;
        };
        heading.setAttribute('aria-label', raw);
        heading.innerHTML = '';
        heading.append(buildLine(line1, 'hero-title-line', false, 0), buildLine(line2, 'hero-title-emline', true, .65));
        if (reduce) {
            heading.classList.add('is-animated');
            return;
        }
        requestAnimationFrame(() => setTimeout(() => heading.classList.add('is-animated'), 140));
    }
    function scrollSectionAnimations() {
        const selectors = ['.manifesto-text', '.manifesto-composition', '.preview-card', '.section-top', '.home-feature-card', '.craft-editorial-content', '.craft-editorial-image', '.closing-copy'];
        selectors.forEach(sel => document.querySelectorAll(sel).forEach(el => { if (!el.classList.contains('reveal'))
            el.classList.add('reveal'); }));
        document.body.classList.add('motion-ready');
        // CSS nth-child rules own stagger timing; no JavaScript inline styles.
        document.querySelectorAll('.craft-editorial-content,.craft-editorial-image').forEach((el, i) => el.classList.add(i === 0 ? 'reveal-right' : 'reveal-left'));
        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver(entries => entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            }), { rootMargin: '0px 0px -12% 0px', threshold: .12 });
            document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        }
        else
            document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
    }
    function buyProduct(id) { const p = products.find(p => p.id === id); if (!p)
        return; if (isHttpUrl(p.checkoutUrl)) {
        window.open(p.checkoutUrl, '_blank', 'noopener,noreferrer');
        return;
    } announce('This design is a preview. The external checkout link for ' + p.name + ' will be added at handover.'); }
    function contactForm() {
        const form = document.querySelector('#enquiry-form');
        if (!form)
            return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!form.reportValidity())
                return;
            const status = document.querySelector('[data-form-feedback]');
            const submit = form.querySelector('[type="submit"]');
            const data = Object.fromEntries(new FormData(form).entries());
            if (!data.consent) {
                status.textContent = 'Please agree to the enquiry privacy statement.';
                return;
            }
            if (isHttpUrl(config.formEndpoint)) {
                submit.disabled = true;
                status.textContent = 'Sending your message…';
                try {
                    const res = await fetch(config.formEndpoint, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
                    if (!res.ok)
                        throw new Error('Form delivery failed');
                    status.textContent = 'Your enquiry was sent. Thank you.';
                    form.reset();
                }
                catch {
                    status.textContent = 'Message could not be sent. Please try again or contact the studio directly.';
                }
                finally {
                    submit.disabled = false;
                }
                return;
            }
            if (config.contactEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(config.contactEmail)) {
                let s = encodeURIComponent('NOVAIRE enquiry — ' + data.interest);
                let body = encodeURIComponent(`${data.message}\n\nFrom: ${data.name}\nEmail: ${data.email}`);
                window.location.href = `mailto:${config.contactEmail}?subject=${s}&body=${body}`;
                status.textContent = 'Your email application is opening. Please send the draft to complete your enquiry.';
                return;
            }
            status.textContent = 'Preview only — connect the client’s form endpoint or email address to receive enquiries.';
        });
    }
    function footerYear() { document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear()); }
    document.addEventListener('DOMContentLoaded', () => { common(); media(); heroTitleAnimation(); scrollSectionAnimations(); productsUI(); craftsmanshipSlideshow(); contactForm(); footerYear(); });
})();
