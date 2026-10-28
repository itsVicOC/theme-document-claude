<?php get_header(); ?>
<main id="main-content" tabindex="-1" class="main-container empty-state">
    <div class="main-main">
        <section class="main-content">
            <img src="<?php echo esc_url( get_template_directory_uri() . '/common/404/404.svg' ); ?>" alt=""/>
            <h1>这个页面暂时找不到了</h1>
            <p>链接可能已经变更，你可以回到首页继续阅读。</p>
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>">返回首页</a>
        </section>
    </div>
</main>
<?php get_footer(); ?>
