<?php

/*
 * 左侧边栏内容
 * */


/*
 * 是否显示
 * */

if ( nicen_theme_showArticleCate() ) {

	$catelog = nicen_theme_navigator();

	if ( ! empty( $catelog ) ) {

		?>
        <div id="space">
            <aside class="main-left isIndex" id="navigator">
                <div class="main-top">
                    <ul>
                        <li class="active">🗂️ 文章导航</li>
                        <!-- <li>修改记录</li>-->
                    </ul>
                    <button type="button" class="toc-collapse iconfont icon-daohang-caidan" aria-label="展开或收起全部章节" aria-expanded="true"></button>
                </div>
                <div class="scroll index-scroll">
                    <div class="line"></div>
                    <!--文章导航-->
                    <ul>
						<?php echo $catelog; ?>
                    </ul>
                </div>
            </aside>
        </div>
		<?php
	}
}