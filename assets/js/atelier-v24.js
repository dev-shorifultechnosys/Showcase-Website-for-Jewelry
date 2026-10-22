/* NOVAIRE Atelier V24: film chapters. No global changes. */
(() => {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const film = document.querySelector('.about-page .craft-film-frame video');
        if (!film)
            return;
        // Native muted autoplay + loop ensures seamless replay when supported.
        // Leave playback controls visible so visitors can pause or restart the film.
        film.muted = true;
        film.defaultMuted = true;
        film.loop = true;
        film.playsInline = true;
        film.autoplay = true;
        const index = document.querySelector('[data-chapter-index]');
        const label = document.querySelector('[data-chapter-label]');
        const chapters = [
            { start: 0, index: '01 / 03', title: 'RING MAKING' },
            { start: 8, index: '02 / 03', title: 'WATCH DETAILS' },
            { start: 16, index: '03 / 03', title: 'LEATHERCRAFT' }
        ];
        let currentChapter = -1;
        function updateChapter() {
            const sec = film.currentTime || 0;
            const next = sec >= 16 ? 2 : sec >= 8 ? 1 : 0;
            if (next === currentChapter)
                return;
            currentChapter = next;
            if (index)
                index.textContent = chapters[next].index;
            if (label)
                label.textContent = chapters[next].title;
        }
        film.addEventListener('timeupdate', updateChapter, { passive: true });
        film.addEventListener('seeked', updateChapter);
        film.addEventListener('loadedmetadata', updateChapter);
        // Some embedded/older media engines do not honor the loop attribute.
        film.addEventListener('ended', () => {
            currentChapter = -1;
            film.currentTime = 0;
            updateChapter();
            film.play().catch(() => { });
        });
        // On mobile the browser may require a user gesture or may be in low-power mode.
        // Keeping native controls ensures playback remains possible when autoplay is blocked.
        film.play().catch(() => { });
    });
})();
