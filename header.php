<?php
/*
 * 全局顶部模板
 * @author 友人a丶
 * @date 2022-07-08
 * */
?>
<!DOCTYPE html>
<html lang="zh-cn" xmlns="http://www.w3.org/1999/html" class="personal">
<head>
    <meta name="theme-color" content="#FAF9F5"/>
    <meta charset="<?php bloginfo( 'charset' ); ?>"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<?php
	/*是否显示主题自带的tdk* */
	if ( nicen_theme_config( 'document_tdk', false ) ) {
		?>
        <title><?php nicen_theme_title() ?></title>
        <meta name="keywords" content="<?php nicen_theme_keywords(); ?>"/>
        <meta name="description" content="<?php nicen_theme_description() ?>"/>
		<?php
	}
	if ( nicen_theme_config( 'document_seo_og', false ) ) {
		echo nicen_theme_og(); //输出og协议内容
	}
	?>
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main-content">跳转到内容</a>
<!--顶部导航栏-->
<header class="main-header">
    <!--  顶部左侧标题 和 logo -->
    <div class="left">
        <a href="<?php echo home_url(); ?>" class="logo" title="返回首页">

			<?php
			/* 如果需要显示logo */
			if ( nicen_theme_config( 'document_header_show_logo', false ) ) {
				echo '<img src="' . esc_url( nicen_theme_config( 'document_logo_url', false ) ) . '" alt=""/>';
			}

			/* 如果需要显示标题*/
			if ( nicen_theme_config( 'document_header_show_title', false ) ) {
				echo '<h2 class="title tooltip"
                data-hint="' . get_bloginfo( 'name' ) . '">' . get_bloginfo( 'name' ) . '</h2>';
			}
			?>


        </a>
    </div>
    <!--移动端展开导航栏-->
    <button type="button" class="daohang" aria-controls="site-navigation" aria-expanded="false" aria-label="打开导航菜单"><i class="iconfont icon-daohangmoren" aria-hidden="true"></i></button>
    <button type="button" class="nav-backdrop" tabindex="-1" aria-label="关闭导航菜单" hidden></button>
    <!--  右边导航栏  -->
    <nav class="right" id="site-navigation" aria-label="主导航">
        <div class="drawer-heading"><span>站点导航</span><button type="button" class="nav-close" aria-label="关闭导航菜单"><span aria-hidden="true">×</span></button></div>
        <!--菜单栏-->
		<?php get_template_part( 'template/index/search' ); ?>
		<?php get_template_part( 'template/index/nav_menu' ); ?>

    </nav>
</header>
