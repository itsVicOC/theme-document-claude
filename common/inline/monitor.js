/* Desktop catalogue only. The mobile <details> uses native anchors. */
$(function ($) {
    const navigator = document.getElementById('navigator');
    if (!navigator) return;
    const scroller = navigator.querySelector('.scroll');
    const desktop = window.matchMedia('(min-width: 1280px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function childrenOf(item) {
        return [...navigator.querySelectorAll('[data-parent]')].filter(child => child.dataset.parent === item.dataset.pid);
    }
    function collapse(item, collapsed) {
        const button = item.querySelector(':scope > div > .toc-toggle');
        if (button) {
            button.setAttribute('aria-expanded', String(!collapsed));
            button.textContent = collapsed ? '+' : '−';
        }
        childrenOf(item).forEach(child => {
            child.hidden = collapsed;
            collapse(child, collapsed);
        });
    }
    navigator.querySelectorAll('li[data-pid]').forEach(item => {
        if (!childrenOf(item).length) return;
        const row = item.querySelector(':scope > div');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'toc-toggle';
        button.textContent = '−';
        button.setAttribute('aria-label', '展开或收起下级章节');
        button.setAttribute('aria-expanded', 'true');
        row.prepend(button);
        button.addEventListener('click', () => collapse(item, button.getAttribute('aria-expanded') === 'true'));
    });
    const collapseAll = navigator.querySelector('.toc-collapse');
    if (collapseAll) collapseAll.addEventListener('click', () => {
        const collapsed = collapseAll.getAttribute('aria-expanded') === 'true';
        navigator.querySelectorAll('li[data-pid]').forEach(item => collapse(item, collapsed));
        collapseAll.setAttribute('aria-expanded', String(!collapsed));
    });

    let pending = false;
    function update() {
        pending = false;
        if (!desktop.matches || !scroller) return;
        const links = [...scroller.querySelectorAll('a[href^="#"]')];
        const headings = links.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1))));
        const offset = document.querySelector('.main-header').getBoundingClientRect().height + 24;
        let active = -1;
        headings.forEach((heading, index) => {
            if (heading && (active === -1 || heading.getBoundingClientRect().top <= offset)) active = index;
        });
        links.forEach((link, index) => {
            link.classList.toggle('toc-active', index === active);
            if (index === active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
        const link = links[active];
        if (!link || !link.getClientRects().length) return;
        const bounds = link.getBoundingClientRect(), frame = scroller.getBoundingClientRect();
        if (bounds.top < frame.top) scroller.scrollTop -= frame.top - bounds.top + 12;
        else if (bounds.bottom > frame.bottom) scroller.scrollTop += bounds.bottom - frame.bottom + 12;
    }
    function queueUpdate() { if (!pending) { pending = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', queueUpdate, { passive: true });
    window.addEventListener('resize', queueUpdate, { passive: true });
    window.addEventListener('load', queueUpdate, { once: true });
    // Dynamic pagination and category tabs can add catalogue entries.
    if (scroller) new MutationObserver(queueUpdate).observe(scroller, { childList: true, subtree: true });
    update();

    $('.icp-beian div').on('click', function () {
        const action = $(this).index() === 0 ? 'document_nice' : 'document_bad';
        const target = $(this).find('.number');
        $.post(`${HOME}/?${action}=${Current}`, () => target.text((parseInt(target.text(), 10) || 0) + 1));
    });
});
