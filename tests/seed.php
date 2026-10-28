<?php
// Executed only by the local Playground blueprint, never on an HTTP request.
if ( ! defined( 'DOCUMENT_CLAUDE_PREVIEW' ) ) { return; }
require '/wordpress/wp-load.php';
switch_theme( 'theme-document-claude' );
$options = [
    'blogname' => '阿许的旧事重提', 'blogdescription' => '技术、观察与生活中的片段。',
    'permalink_structure' => '/%postname%/', 'posts_per_page' => 5,
    'document_logo_url' => get_template_directory_uri() . '/assets/images/logo.png',
    'document_thumbnail_default' => get_template_directory_uri().'/assets/images/default.png', 'document_catelog_mode' => 'html',
    'document_single_show_catalog' => 1, 'document_rewrite_author' => 0,
    'document_rewrite_search' => 0, 'document_rewrite_page' => 0,
    'document_paginate_auto_load_index' => 0, 'document_paginate_auto_load_else' => 0,
    'document_footer_extra' => '基于 WordPress · Document Claude · 苏ICP备2021051620号-1',
];
foreach ( $options as $key => $value ) { update_option( $key, $value ); }
foreach ( get_posts( [ 'post_type' => ['post','page'], 'numberposts' => -1 ] ) as $post ) { wp_delete_post( $post->ID, true ); }
$category = wp_insert_term( '技术与观察', 'category' );
$category_id = is_wp_error($category) ? get_cat_ID('技术与观察') : $category['term_id'];
$paragraph = '<p>好的阅读体验，应该让内容自然地出现在眼前。我们保留熟悉的暖白与赤陶色，同时让标题、正文和留白拥有清晰的节奏。无论是在手机、平板还是桌面上，文字都应当易于阅读，操作也应当触手可及。This paragraph checks natural English word wrapping and mixed-language typography.</p>';
$long_url = 'https://example.com/' . str_repeat('long-unbroken-path-', 18);
$sections = '';
for ( $i = 1; $i <= 14; $i++ ) {
    $sections .= '<h2>第'.$i.'节：技术改变生活，体验来自细节</h2>'.$paragraph.'<h3>观察与实践 '.$i.'</h3>'.$paragraph.'<h4>实践笔记 '.$i.'</h4>'.$paragraph;
}
$table = '<table><thead><tr>';
for ( $i = 1; $i <= 8; $i++ ) { $table .= '<th>指标'.$i.'</th>'; }
$table .= '</tr></thead><tbody><tr>';
for ( $i = 1; $i <= 8; $i++ ) { $table .= '<td>这是用于验证表格独立横向滚动的完整测试数据'.$i.'</td>'; }
$table .= '</tr></tbody></table>';
$content = '<img src="'.get_template_directory_uri().'/assets/images/bg.jpg" alt="文章示例图片" width="1200" height="800"/>'.$paragraph.$table.'<pre class="language-javascript"><code>const documentTheme = "'.str_repeat('keep-code-readable-',20).'";</code></pre><p><a href="'.$long_url.'">'.$long_url.'</a></p><blockquote>用适当的留白，让阅读回到内容本身。</blockquote>'.$sections;
$titles = ['数字人民币2.0：支付行业真正的变量来了', '智能穿戴2026：手表之后，AI眼镜能否接棒？', '智能驾驶从“能开”到“敢坐”，还差最后一公里', '一篇没有缩略图的文章，内容也值得认真阅读', 'DeepSeek与开源模型：从技术参数到真实体验的长标题测试', '支付行业的2026：从抢地盘到拼内功', '从一段代码开始，记录今天的新发现', '在更小的屏幕上，保留完整的阅读节奏', '当标题含有 "引号" 与 <符号> 时', '让博客回归记录与分享'];
$attachments = [];
foreach (['bg.jpg', 'default.png'] as $filename) {
    $upload = wp_upload_bits($filename, null, file_get_contents(get_template_directory().'/assets/images/'.$filename));
    $id = wp_insert_attachment(['post_mime_type'=>str_ends_with($filename, '.png') ? 'image/png' : 'image/jpeg', 'post_title'=>$filename, 'post_status'=>'inherit', 'guid'=>$upload['url']], $upload['file']);
    wp_update_attachment_metadata($id, ['width'=>1200, 'height'=>800, 'file'=>_wp_relative_upload_path($upload['file'])]);
    $attachments[]=$id;
}
$posts = [];
foreach ( $titles as $index => $title ) {
    $posts[] = wp_insert_post( ['post_title'=>$title, 'post_name'=> $index === 0 ? 'reading-test' : 'sample-'.($index+1), 'post_content'=>$index === 0 ? $content : '<h2>写在前面</h2>'.$paragraph.'<h3>一些观察</h3>'.$paragraph, 'post_excerpt'=>strip_tags($paragraph), 'post_status'=>'publish', 'post_author'=>1, 'post_category'=>[$category_id], 'comment_status'=>'open', 'post_date'=>gmdate('Y-m-d H:i:s', time()-$index*86400)] );
    update_post_meta(end($posts), 'post_views_count', 128+$index*37);
    if ($index !== 3) { set_post_thumbnail(end($posts), $attachments[$index%2]); }
}
wp_insert_comment(['comment_post_ID'=>$posts[0], 'comment_author'=>'读者', 'comment_author_email'=>'reader@example.com','comment_content'=>'很喜欢这个温暖的阅读界面。手机上的目录和表格也应该便于使用。','comment_approved'=>1]);
$archive = wp_insert_post(['post_title'=>'文章聚合','post_name'=>'pages','post_type'=>'page','post_status'=>'publish']);
update_post_meta($archive, '_wp_page_template', 'template/page/posts.php');
$messages = wp_insert_post(['post_title'=>'雁过留声','post_name'=>'messages','post_type'=>'page','post_status'=>'publish','post_content'=>'<p>Hi！感谢你访问我的 Blog，如果有想说的话，请给我留言～</p>', 'comment_status'=>'open']);
update_post_meta($messages, '_wp_page_template', 'template/page/board.php');
$menu = wp_create_nav_menu('首页菜单');
if (is_wp_error($menu)) { $menu = wp_get_nav_menu_object('首页菜单')->term_id; }
$parent = 0;
foreach ( ['首页'=>home_url('/'), '文章聚合'=>get_permalink($archive), '雁过留声'=>get_permalink($messages), '更多'=>home_url('/#more')] as $label=>$url ) {
    $id = wp_update_nav_menu_item($menu, 0, ['menu-item-title'=>$label, 'menu-item-url'=>$url, 'menu-item-status'=>'publish']);
    if ($label === '更多') $parent = $id;
}
$child = wp_update_nav_menu_item($menu, 0, ['menu-item-title'=>'技术与观察','menu-item-url'=>get_category_link($category_id),'menu-item-parent-id'=>$parent,'menu-item-status'=>'publish']);
wp_update_nav_menu_item($menu, 0, ['menu-item-title'=>'阅读体验测试','menu-item-url'=>get_permalink($posts[0]),'menu-item-parent-id'=>$child,'menu-item-status'=>'publish']);
set_theme_mod('nav_menu_locations', ['top-leval'=>$menu]);
update_option('theme_mods_theme-document-claude-before', get_option('theme_mods_theme-document-claude'));
$theme_url=get_template_directory_uri();
update_option('widget_author', [2=>['nickname'=>'itsVic','profession'=>'产品经理','description'=>'记录技术趋势，分享观察与思考。','avatar'=>$theme_url.'/assets/images/avatars.jpg','beijin'=>$theme_url.'/assets/images/bg.jpg'], '_multiwidget'=>1]);
update_option('widget_rand', [2=>['title'=>'最新文章','type'=>1,'number'=>5,'show'=>1], '_multiwidget'=>1]);
update_option('sidebars_widgets', ['index_sidebar'=>['author-2','rand-2'], 'content_sidebar'=>['rand-2'], 'wp_inactive_widgets'=>[], 'array_version'=>3]);
flush_rewrite_rules();
// Test variants live only in this disposable runtime, never in the installable theme.
wp_mkdir_p(WPMU_PLUGIN_DIR);
file_put_contents(WPMU_PLUGIN_DIR.'/document-preview.php', <<<'PHP'
<?php
if (isset($_GET['review']) && $_GET['review'] === 'before' && is_dir(WP_CONTENT_DIR.'/themes/theme-document-claude-before')) {
    add_filter('template', fn() => 'theme-document-claude-before');
    add_filter('stylesheet', fn() => 'theme-document-claude-before');
}
add_action('after_setup_theme', function() {
    global $desination_configs;
    if (isset($_GET['toc']) && $_GET['toc'] === 'off') $desination_configs['document_single_show_catalog'] = 0;
    if (isset($_GET['thumb']) && $_GET['thumb'] === 'left') $desination_configs['document_thumbnail_position'] = 'left';
    if (isset($_GET['sidebars']) && $_GET['sidebars'] === 'off') {
        foreach (['document_show_sidebar','document_single_show_sidebar','document_show_left_nav','document_single_show_catalog'] as $key) $desination_configs[$key] = 0;
    }
});
PHP
);
global $wp_version;
file_put_contents(WP_CONTENT_DIR.'/uploads/document-preview-runtime.json', json_encode(['wordpress'=>$wp_version,'php'=>PHP_VERSION]));
echo 'Seeded local preview. Reading article: '.get_permalink($posts[0]);
