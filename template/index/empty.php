<?php
// Empty searches share navigation, typography and colour modes with the site.
get_header();
?>
<main id="main-content" tabindex="-1" class="main-container empty-state">
    <div class="main-main">
        <section class="main-content">
            <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/empty.svg' ); ?>" alt=""/>
            <h1>没有找到相关文章</h1>
            <p>没有找到与“<?php echo esc_html( get_search_query() ); ?>”相关的内容，试试其他关键词。</p>
            <form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
                <label class="screen-reader-text" for="empty-search">换个关键词搜索</label>
                <input id="empty-search" type="search" name="s" placeholder="输入关键词…" value="<?php echo esc_attr( get_search_query() ); ?>"/>
                <button type="submit">搜索</button>
            </form>
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>">返回首页</a>
        </section>
    </div>
</main>
<?php get_footer(); ?>
