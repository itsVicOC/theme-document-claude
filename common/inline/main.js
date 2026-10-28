/*
* 切换主题皮肤
* */
function toggleTheme(flag = true) {
    if (flag) {
        //暗黑主题
        $('html')
            .addClass('dark')
            .removeClass('personal');
        //标记暗黑模式
        try { localStorage.setItem('night', 1); } catch (e) { /* Storage may be disabled. */ }
        //改变图标
        $(function () {
            $('.read-mode').attr('aria-pressed', 'true').attr('aria-label', '切换浅色模式').find('.mode-label').text('浅色模式');
            $('.read-mode i')
                .removeClass("icon-baitian-qing")
                .addClass("icon-yueliang");
        });
    } else {
        //暗黑主题
        $('html')
            .removeClass('dark')
            .addClass('personal');
        //移除暗黑模式标记
        try { localStorage.removeItem('night'); } catch (e) { /* Storage may be disabled. */ }
        //改变图标
        $(function () {
            $('.read-mode').attr('aria-pressed', 'false').attr('aria-label', '切换深色模式').find('.mode-label').text('深色模式');
            $('.read-mode i')
                .removeClass("icon-yueliang")
                .addClass("icon-baitian-qing");
        });
    }
}


/* Keep legacy consumers in sync with the user's actual root font size. */
function syncRootRem() {
    window.rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
}
window.addEventListener('resize', syncRootRem, { passive: true });
syncRootRem();

/*同步阅读模式（夜间模式保留；旧的主题色切换已移除）*/
let night;
try { night = localStorage.getItem('night'); } catch (e) { /* Use light mode. */ }

/*
* 是否需要切换模式
* */
if (!!night) {
    toggleTheme(true); //切换暗黑
}

/*
* 获取元素在网页的实际top
* */
$.fn.getTop = function () {
    return this.length ? this.get(0).getBoundingClientRect().top + window.scrollY : 0;
}


/*jq内存清理函数*/
$.fn.removeWithLeakage = function () {
    this.each(function (i, e) {
        $("*", e).add([e]).each(function () {
            $.event.remove(this);
            $.removeData(this);
        });
        if (e.parentNode)
            e.parentNode.removeChild(e);
    });
};
