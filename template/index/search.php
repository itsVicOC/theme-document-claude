<?php
/*
 * 文章搜索
 * */
?>
<!--  搜索图标  -->
<form class="menu-left" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
    <div class="search-div">
        <!--  搜索图标  -->
        <button type="submit" class="search-icon iconfont icon-sousuo" aria-label="搜索"></button>
        <!--  搜索框  -->
        <label class="screen-reader-text" for="search">搜索文章</label>
        <input id="search" name="s" class="search" type="search" placeholder="搜索文章…" value="<?php echo esc_attr( get_search_query() ); ?>"/>
    </div>
</form>
