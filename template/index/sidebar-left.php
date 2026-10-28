<?php

/*
 * 左侧边栏内容
 * */


/*
 * 是否显示
 * */
if ( nicen_theme_showCatelog() ) {

	$catelog = nicen_theme_navigator();

	if ( ! empty( $catelog ) ) {

		?>
        <div id="space">
            <aside class="main-left" id="navigator">
                <div class="main-top">
                    <ul>
                        <li class="active">🗂️ 文章目录</li>
                        <!-- <li>修改记录</li>-->
                    </ul>
                    <button type="button" class="toc-collapse iconfont icon-daohang-caidan" aria-label="展开或收起全部章节" aria-expanded="true"></button>
                </div>
                <div class="scroll">
                    <div class="line"></div>
                    <!--文章导航-->
                    <ul>
						<?php echo $catelog; ?>
                    </ul>
                </div>

                <div class="icp-beian">
                    <div>
                        <span class="number"><?php echo nicen_theme_getPostNice( get_the_ID() ); ?></span>
                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/zan.svg" title="点赞"/>
                    </div>
                    <div>
                        <span class="number"><?php echo nicen_theme_getPostBad( get_the_ID() ); ?></span>
                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/cai.svg" title="踩"/>
                    </div>
                </div>
            </aside>
        </div>
		<?php
	}
}