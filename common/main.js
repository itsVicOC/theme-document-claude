/* Shared frontend interactions. Layout and sticky positioning live in SCSS. */
$(function ($) {
    // Kept for existing pagination/widget integrations.
    window.computed = window.toFixed = function () {};
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (location.search.includes('replytocom') && $('.comment-form').length) {
        window.scrollTo(0, Math.max(0, $('.comment-form').getTop() - 88));
    }

    const progress = document.getElementById('progress');
    const toTop = document.querySelector('.toTop');
    function updateProgress() {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const value = height > 0 ? Math.min(100, Math.max(0, Math.round(window.scrollY / height * 100))) : 100;
        if (progress) {
            progress.textContent = value + '%';
            progress.setAttribute('aria-valuenow', value);
        }
        if (toTop) toTop.style.visibility = window.scrollY > 240 ? 'visible' : 'hidden';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    window.addEventListener('load', updateProgress, { once: true });
    updateProgress();
    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
    $('.read-mode').on('click', () => toggleTheme(!document.documentElement.classList.contains('dark')));

    if (typeof Viewer !== 'undefined') {
        document.querySelectorAll('.viewerLightBox').forEach(image => new Viewer(image, { navbar: false }));
    }

    // Confine wide content to its own scroll region, without hiding page overflow.
    document.querySelectorAll('.main-article table').forEach(table => {
        if (table.parentElement.classList.contains('table-scroll')) return;
        const region = document.createElement('div');
        region.className = 'table-scroll';
        region.tabIndex = 0;
        region.setAttribute('role', 'region');
        region.setAttribute('aria-label', '表格，可横向滚动');
        table.before(region);
        region.append(table);
    });
    document.querySelectorAll('.main-article pre').forEach(pre => { pre.tabIndex = 0; });
    document.querySelectorAll('.mobile-toc a').forEach(link => link.addEventListener('click', () => {
        link.closest('details').open = false;
    }));

    const panel = document.getElementById('site-navigation');
    const trigger = document.querySelector('.daohang');
    const backdrop = document.querySelector('.nav-backdrop');
    const close = document.querySelector('.nav-close');
    if (!panel || !trigger) return;
    const mobile = window.matchMedia('(max-width: 1279px)');
    let opened = false;
    let savedScroll = 0;
    const inertBefore = new Map();

    panel.querySelectorAll('.menu-item-has-children').forEach((item, index) => {
        const submenu = item.querySelector(':scope > .sub-menu');
        const link = item.querySelector(':scope > a');
        if (!submenu || !link) return;
        submenu.id = `site-submenu-${index}`;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'submenu-toggle';
        button.textContent = '+';
        button.setAttribute('aria-label', `展开${link.textContent.trim()}的子菜单`);
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', submenu.id);
        link.after(button);
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') !== 'true';
            button.setAttribute('aria-expanded', String(expanded));
            button.textContent = expanded ? '−' : '+';
            button.setAttribute('aria-label', `${expanded ? '收起' : '展开'}${link.textContent.trim()}的子菜单`);
            item.classList.toggle('submenu-open', expanded);
        });
    });

    function setOpen(value, restoreFocus = true) {
        const wasOpen = opened;
        opened = value && mobile.matches;
        trigger.setAttribute('aria-expanded', String(opened));
        trigger.setAttribute('aria-label', opened ? '关闭导航菜单' : '打开导航菜单');
        if (opened && !wasOpen) {
            savedScroll = window.scrollY;
            document.body.style.setProperty('--nav-scroll-top', `-${savedScroll}px`);
            for (const element of document.body.children) {
                if (element.contains(panel) || ['SCRIPT', 'STYLE', 'LINK'].includes(element.tagName)) continue;
                inertBefore.set(element, element.inert);
                element.inert = true;
            }
        }
        document.documentElement.classList.toggle('nav-open', opened);
        backdrop.hidden = !opened;
        panel.inert = mobile.matches && !opened;
        if (mobile.matches) panel.setAttribute('aria-hidden', String(!opened));
        else panel.removeAttribute('aria-hidden');
        if (opened) close.focus();
        else if (wasOpen) {
            for (const [element, previous] of inertBefore) element.inert = previous;
            inertBefore.clear();
            document.body.style.removeProperty('--nav-scroll-top');
            window.scrollTo(0, savedScroll);
            if (restoreFocus && mobile.matches) trigger.focus();
        }
    }
    trigger.addEventListener('click', () => setOpen(!opened));
    close.addEventListener('click', () => setOpen(false));
    backdrop.addEventListener('click', () => setOpen(false));
    panel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false, false)));
    document.addEventListener('keydown', event => {
        if (!opened) return;
        if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
        if (event.key !== 'Tab') return;
        const focusable = [...panel.querySelectorAll('a[href], button, input, [tabindex="0"]')]
            .filter(element => !element.disabled && element.getClientRects().length);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    mobile.addEventListener('change', () => {
        setOpen(false, false);
        panel.querySelectorAll('.submenu-open').forEach(item => item.classList.remove('submenu-open'));
        panel.querySelectorAll('.submenu-toggle').forEach(button => {
            button.setAttribute('aria-expanded', 'false');
            button.textContent = '+';
        });
    });
    setOpen(false, false);
});
