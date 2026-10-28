<?php
// Reuse the configured catalogue and anchors; never enable it on the user's behalf.
if ( ! nicen_theme_showCatelog() ) {
	return;
}
$catalogue = nicen_theme_navigator();
if ( empty( $catalogue ) ) {
	return;
}
?>
<details class="mobile-toc">
    <summary>文章目录</summary>
    <nav aria-label="文章目录"><ul><?php echo $catalogue; ?></ul></nav>
</details>
