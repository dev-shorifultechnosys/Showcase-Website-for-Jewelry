/* NOVAIRE Collections controller (ES6+, no libraries).
 * Hooks: [data-gallery-category] product regions, [data-open-gallery] modal triggers,
 * [data-variant-card] colour selection, [data-g-search] filtering.
 * Client backend may replace window.NOVAIRE_GALLERY_PRODUCTS, preserving the documented IDs.
 * Checkout links MUST be supplied and verified; empty links render enquiry CTA.
 */
/* NOVAIRE Collections V17 — collections page only, home page untouched. */
(() => {
    'use strict';
    const items = window.NOVAIRE_GALLERY_PRODUCTS || [];
    const categories = ['rings', 'watches', 'straps'];
    const catTitles = { rings: 'Designer Rings', watches: 'Bespoke Watches', straps: 'Leather Watch Straps' };
    const catDescriptions = { rings: 'Fine jewellery', watches: 'Timepieces', straps: 'Leatherwork' };
    const byId = new Map(items.map(p => [p.id, p]));
    const legacy = { r1: 'r01', w1: 'w01', s1: 's01', r2: 'r02', r3: 'r03', w2: 'w02', w3: 'w03', s2: 's02', s3: 's03' };
    const state = Object.fromEntries(categories.map(cat => [cat, { search: '', style: 'All styles', sort: 'featured' }]));
    const selectedVariant = new Map(items.map(p => [p.id, 0]));
    const imageBase = 'assets/images/';
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const approvedLink = url => { try {
        const u = new URL(url);
        return u.protocol === 'https:' && u.hostname.includes('.');
    }
    catch {
        return false;
    } };
    const checkoutOf = (p, v) => approvedLink(v?.checkoutUrl) ? v.checkoutUrl : (approvedLink(p.checkoutUrl) ? p.checkoutUrl : '');
    const imageUrl = file => imageBase + file;
    // Local images: WebP source + JPG fallback; smaller derivatives generated at build handoff.
    const jpgUrl = url => url.replace(/\.webp$/i, '.jpg');
    const responsiveImage = (url, alt, cssClass = '') => {
        const low = url.replace(/\.webp$/i, '-480w.webp');
        const lowJpg = jpgUrl(low);
        const sourceSet = `${low} 480w, ${url} 1470w`;
        return `<picture class="${cssClass}"><source type="image/webp" srcset="${esc(sourceSet)}" sizes="(min-width: 1400px) 430px, (min-width: 700px) 31vw, 46vw"><img alt="${esc(alt)}" src="${esc(jpgUrl(url))}" srcset="${esc(lowJpg)} 480w, ${esc(jpgUrl(url))} 1470w" sizes="(min-width: 1400px) 430px, (min-width: 700px) 31vw, 46vw" width="1470" height="1000" loading="lazy" decoding="async"></picture>`;
    };
    const currentVariant = p => p.variants?.[selectedVariant.get(p.id) || 0] || null;
    const mainImage = (p, v) => v?.image ? imageUrl(v.image) : imageUrl(p.image);
    const visibleProducts = cat => { let list = items.filter(p => p.category === cat), f = state[cat]; if (f.search) {
        const q = f.search.toLowerCase();
        list = list.filter(p => [p.name, p.style, p.description, p.eyebrow, (p.variants || []).map(v => v.name).join(' ')].join(' ').toLowerCase().includes(q));
    } if (f.style !== 'All styles')
        list = list.filter(p => p.style === f.style); if (f.sort === 'az')
        list.sort((a, b) => a.name.localeCompare(b.name)); if (f.sort === 'za')
        list.sort((a, b) => b.name.localeCompare(a.name)); return list; };
    function options(p) { return (p.variants || []).map((v, i) => `<button type="button" class="product-card__variant ${i === (selectedVariant.get(p.id) || 0) ? 'selected' : ''}" data-variant-card="${esc(p.id)}" data-variant-index="${i}" aria-label="Select ${esc(v.name)} finish for ${esc(p.name)}" aria-pressed="${String(i === (selectedVariant.get(p.id) || 0))}" title="${esc(v.name)}"><span class="g-swatch--${esc(p.id)}-${i}"></span></button>`).join(''); }
    function cardMarkup(p, i) {
        const v = currentVariant(p), checkout = checkoutOf(p, v), action = checkout ? `<a target="_blank" rel="noopener noreferrer" href="${esc(checkout)}" data-card-checkout="${esc(p.id)}">BUY NOW ↗</a>` : `<a href="contact.html" class="product-card__enquiry">ENQUIRE ↗</a>`;
        return `<article class="product-card product-card--catalogue" data-g-reveal data-model="${esc(p.id)}">
  <button class="product-card__visual" type="button" data-open-gallery="${esc(p.id)}" aria-label="View ${esc(p.name)} details and gallery">
    ${responsiveImage(mainImage(p, v), p.alt)}<span class="product-card__zoom-cue" aria-hidden="true">↗</span>
  </button><div class="product-card__body"><div class="product-card__eyebrow"><span>${esc(catDescriptions[p.category])}</span><small>DESIGN ${String(i + 1).padStart(2, '0')}</small></div>
    <h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>
    <div class="product-card__meta"><span class="product-card__style">${esc(p.eyebrow)}</span><span class="product-card__note">Design study</span></div>
    <div class="product-card__swatch-row"><span class="product-card__variant-label" data-card-variant="${esc(p.id)}">Finish: ${esc(v?.name || 'As shown')}</span><div class="product-card__swatches" aria-label="Finish colour options shown for reference">${options(p)}</div></div>
    <div class="product-card__actions"><button type="button" data-open-gallery="${esc(p.id)}">VIEW DETAILS <span aria-hidden="true">↗</span></button>${action}</div>
  </div></article>`;
    }
    function renderToolbar(cat) {
        const styles = [...new Set(items.filter(p => p.category === cat).map(p => p.style))];
        document.querySelector(`[data-filter-category="${cat}"]`).innerHTML = `<div class="collection-filter__heading"><span>THE ${catTitles[cat].toUpperCase()} EDIT</span><span aria-live="polite" data-filter-count="${cat}">${visibleProducts(cat).length} pieces</span></div>
 <div class="collection-filter__fields"><label class="collection-filter__search"><span class="sr-only">Search ${catTitles[cat]}</span><input type="search" data-g-search="${cat}" placeholder="Search the collection" autocomplete="off" value="${esc(state[cat].search)}"></label>
 <label class="collection-filter__select"><span>STYLE</span><select data-g-style="${cat}" aria-label="Filter ${catTitles[cat]} by style"><option>All styles</option>${styles.map(st => `<option value="${esc(st)}" ${state[cat].style === st ? 'selected' : ''}>${esc(st)}</option>`).join('')}</select></label>
 <label class="collection-filter__select"><span>SORT</span><select data-g-sort="${cat}" aria-label="Sort ${catTitles[cat]}"><option value="featured">Featured</option><option value="az" ${state[cat].sort === 'az' ? 'selected' : ''}>Name: A–Z</option><option value="za" ${state[cat].sort === 'za' ? 'selected' : ''}>Name: Z–A</option></select></label>
 </div>`;
    }
    const seenReveals = new WeakSet();
    let revealObserver = null;
    function prepareAnimations() { if (matchMedia('(prefers-reduced-motion:reduce)').matches)
        return; if ('IntersectionObserver' in window) {
        revealObserver = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
        } }); }, { rootMargin: '0px 0px -6% 0px', threshold: .05 });
        document.body.classList.add('g-motion-on');
        document.querySelectorAll('[data-g-reveal]').forEach(track);
    } }
    function track(el) { if (seenReveals.has(el))
        return; seenReveals.add(el); if (el.getBoundingClientRect().top < innerHeight * .97) {
        el.classList.add('in-view');
        return;
    } revealObserver?.observe(el); }
    function renderCategory(cat) { const host = document.querySelector(`[data-gallery-category="${cat}"]`); if (!host)
        return; const list = visibleProducts(cat); host.innerHTML = list.length ? list.map(cardMarkup).join('') : `<div class="collection-filter__empty">No designs match your search. <button type="button" data-reset="${cat}">Clear filters ↗</button></div>`; const count = document.querySelector(`[data-filter-count="${cat}"]`); if (count)
        count.textContent = `${list.length} of ${items.filter(p => p.category === cat).length} pieces`; if (revealObserver)
        host.querySelectorAll('[data-g-reveal]').forEach(track); if (!revealObserver)
        host.querySelectorAll('[data-g-reveal]').forEach(el => el.classList.add('in-view')); }
    let active = null, activeIndex = 0, lastFocus = null, activePhotos = [];
    const modal = document.getElementById('gallery-viewer');
    function renderModal() {
        if (!active)
            return;
        const v = currentVariant(active), pic = modal.querySelector('[data-gallery-image]');
        const images = [...new Set([mainImage(active, v), ...(active.photos || []).map(imageUrl)])];
        activePhotos = images;
        activeIndex = Math.min(activeIndex, images.length - 1);
        pic.src = jpgUrl(images[activeIndex]);
        pic.alt = active.alt;
        const source = pic.closest('picture')?.querySelector('source');
        if (source)
            source.srcset = images[activeIndex].replace(/\.webp$/i, '-480w.webp') + ' 480w, ' + images[activeIndex] + ' 1470w';
        pic.srcset = jpgUrl(images[activeIndex].replace(/\.webp$/i, '-480w.webp')) + ' 480w, ' + jpgUrl(images[activeIndex]) + ' 1470w';
        modal.querySelector('[data-gallery-zoom]').classList.remove('zoomed');
        modal.querySelector('[data-gallery-kicker]').textContent = catTitles[active.category];
        modal.querySelector('[data-gallery-title]').textContent = active.name;
        modal.querySelector('[data-gallery-desc]').textContent = active.description;
        const priceEl = modal.querySelector('[data-gallery-price]');
        priceEl.textContent = '';
        priceEl.hidden = true;
        modal.querySelector('[data-gallery-count]').textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;
        modal.querySelector('[data-gallery-prev]').hidden = images.length < 2;
        modal.querySelector('[data-gallery-next]').hidden = images.length < 2;
        modal.querySelector('[data-gallery-thumbs]').innerHTML = images.length > 1 ? images.map((url, i) => `<button type="button" aria-label="View image ${i + 1}" data-gallery-thumb="${i}" class="${i === activeIndex ? 'active' : ''}">${responsiveImage(url, "", "g-modal-thumb__media")}</button>`).join('') : '';
        modal.querySelector('[data-gallery-variants]').innerHTML = `<h3>FINISH OPTIONS</h3><div class="g-modal-options">${(active.variants || []).map((opt, i) => `<button type="button" data-modal-variant="${i}" class="${i === (selectedVariant.get(active.id) || 0) ? 'active' : ''}" aria-pressed="${i === (selectedVariant.get(active.id) || 0)}"><span class="g-swatch--${esc(active.id)}-${i}"></span>${esc(opt.name)}</button>`).join('')}</div>`;
        modal.querySelector('[data-gallery-specs]').innerHTML = `<h3>DETAILS</h3>${Object.entries(active.specs || {}).map(([key, value]) => `<div class="g-spec-row"><span>${esc(key)}</span><span>${esc(value)}</span></div>`).join('')}`;
        const checkout = checkoutOf(active, v);
        modal.querySelector('[data-gallery-action]').innerHTML = checkout ? `<a class="g-modal-action" target="_blank" rel="noopener noreferrer" href="${esc(checkout)}">BUY NOW — EXTERNAL CHECKOUT ↗</a>` : `<a class="g-modal-action" href="contact.html">ENQUIRE ABOUT THIS PIECE ↗</a>`;
    }
    function openModal(id) { id = legacy[id] || id; const p = byId.get(id); if (!p)
        return; active = p; activeIndex = 0; lastFocus = document.activeElement; modal.hidden = false; document.body.classList.add('g-modal-open'); renderModal(); modal.querySelector('.g-modal-close').focus(); }
    function closeModal() { if (modal.hidden)
        return; modal.hidden = true; document.body.classList.remove('g-modal-open'); active = null; lastFocus?.focus(); }
    function step(d) { if (activePhotos.length < 2)
        return; activeIndex = (activeIndex + d + activePhotos.length) % activePhotos.length; renderModal(); }
    function updateCardVariant(id, i) {
        const p = byId.get(id);
        if (!p || !p.variants[i])
            return;
        selectedVariant.set(id, i);
        const card = document.querySelector(`[data-model="${id}"]`);
        if (card) {
            card.querySelector('[data-card-variant]').textContent = `Finish: ${p.variants[i].name}`;
            card.querySelectorAll('[data-variant-index]').forEach(b => { const on = Number(b.dataset.variantIndex) === i; b.classList.toggle('selected', on); b.setAttribute('aria-pressed', String(on)); });
            const action = card.querySelector('[data-card-checkout]');
            const checkout = checkoutOf(p, p.variants[i]);
            if (action) {
                if (checkout)
                    action.href = checkout;
                else
                    action.outerHTML = '<a href="contact.html" class="product-card__enquiry">ENQUIRE ↗</a>';
            }
            else if (checkout) {
                card.querySelector('.product-card__enquiry')?.replaceWith(Object.assign(document.createElement('a'), { href: checkout, target: '_blank', rel: 'noopener noreferrer', textContent: 'BUY NOW ↗' }));
            }
            if (p.variants[i].image) {
                const im = card.querySelector('.product-card__visual img');
                const next = imageUrl(p.variants[i].image);
                im.src = jpgUrl(next);
                im.srcset = jpgUrl(next.replace(/\.webp$/i, '-480w.webp')) + ' 480w, ' + jpgUrl(next) + ' 1470w';
                const source = im.closest('picture')?.querySelector('source');
                if (source)
                    source.srcset = next.replace(/\.webp$/i, '-480w.webp') + ' 480w, ' + next + ' 1470w';
            }
        }
        if (active?.id === id) {
            activeIndex = 0;
            renderModal();
        }
    }
    function events() {
        document.addEventListener('click', e => { let b = e.target.closest('[data-open-gallery]'); if (b) {
            openModal(b.dataset.openGallery);
            return;
        } b = e.target.closest('[data-variant-card]'); if (b) {
            updateCardVariant(b.dataset.variantCard, Number(b.dataset.variantIndex));
            return;
        } b = e.target.closest('[data-reset]'); if (b) {
            state[b.dataset.reset] = { search: '', style: 'All styles', sort: 'featured' };
            renderToolbar(b.dataset.reset);
            renderCategory(b.dataset.reset);
            return;
        } b = e.target.closest('[data-modal-variant]'); if (b && active) {
            updateCardVariant(active.id, Number(b.dataset.modalVariant));
            return;
        } b = e.target.closest('[data-close-gallery]'); if (b) {
            closeModal();
            return;
        } b = e.target.closest('[data-gallery-next]'); if (b) {
            step(1);
            return;
        } b = e.target.closest('[data-gallery-prev]'); if (b) {
            step(-1);
            return;
        } b = e.target.closest('[data-gallery-thumb]'); if (b) {
            activeIndex = Number(b.dataset.galleryThumb);
            renderModal();
            return;
        } b = e.target.closest('[data-gallery-zoom]'); if (b) {
            b.classList.toggle('zoomed');
            b.setAttribute('aria-label', b.classList.contains('zoomed') ? 'Reset image zoom' : 'Zoom image');
            return;
        } });
        document.addEventListener('input', e => { if (e.target.matches('[data-g-search]')) {
            const cat = e.target.dataset.gSearch;
            state[cat].search = e.target.value;
            renderCategory(cat);
        } });
        document.addEventListener('change', e => { if (e.target.matches('[data-g-style]')) {
            const cat = e.target.dataset.gStyle;
            state[cat].style = e.target.value;
            renderCategory(cat);
        } if (e.target.matches('[data-g-sort]')) {
            const cat = e.target.dataset.gSort;
            state[cat].sort = e.target.value;
            renderCategory(cat);
        } });
        document.addEventListener('keydown', e => { if (modal.hidden)
            return; if (e.key === 'Escape') {
            e.preventDefault();
            closeModal();
            return;
        } if (e.key === 'ArrowRight') {
            e.preventDefault();
            step(1);
        } if (e.key === 'ArrowLeft') {
            e.preventDefault();
            step(-1);
        } if (e.key === 'Tab') {
            const focusable = [...modal.querySelectorAll('button:not(:disabled),a[href]')].filter(el => el.getClientRects().length > 0 && !el.hidden);
            if (!focusable.length)
                return;
            const f = focusable[0], l = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === f) {
                e.preventDefault();
                l.focus();
            }
            else if (!e.shiftKey && document.activeElement === l) {
                e.preventDefault();
                f.focus();
            }
        } });
    }
    function categoryNav() { const tabs = [...document.querySelectorAll('[data-gallery-tab]')]; if (!('IntersectionObserver' in window))
        return; const obs = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting)
        tabs.forEach(tab => { const on = tab.dataset.galleryTab === entry.target.id; tab.classList.toggle('active', on); if (on)
            tab.setAttribute('aria-current', 'location');
        else
            tab.removeAttribute('aria-current'); }); }), { rootMargin: '-70px 0px -55% 0px', threshold: 0 }); document.querySelectorAll('.collection-section').forEach(el => obs.observe(el)); tabs[0]?.classList.add('active'); }
    function init() { categories.forEach(cat => { renderToolbar(cat); renderCategory(cat); }); events(); prepareAnimations(); categoryNav(); const query = new URLSearchParams(location.search); let id = query.get('item'); if (id && (byId.has(id) || legacy[id]))
        requestAnimationFrame(() => openModal(id)); }
    document.addEventListener('DOMContentLoaded', init);
})();
