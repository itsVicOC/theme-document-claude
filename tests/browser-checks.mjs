// Run from the Codex browser runtime: await runWidths(tab, viewport).
// Browser interactions use the same supported CUA tab/viewport APIs as manual QA.
export async function runWidths(tab, viewport, path = '/') {
  const rows = [];
  await tab.goto(`http://127.0.0.1:9400${path}`);
  for (const width of [320,390,480,481,768,1023,1024,1025,1279,1280,1440]) {
    await viewport.set({width, height:900});
    const result = await tab.playwright.evaluate(() => {
      const visible = selector => {
        const element = document.querySelector(selector);
        return !!element && getComputedStyle(element).display !== 'none' && element.getBoundingClientRect().width > 0;
      };
      const text = document.body.innerText;
      return {
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        left: visible('#space'), right: visible('#fixed'), drawer: visible('.daohang'),
        mobileToc: visible('.mobile-toc'), mainWidth: document.querySelector('.main-main')?.getBoundingClientRect().width,
        rootFont: getComputedStyle(document.documentElement).fontSize,
        headerOpacity: getComputedStyle(document.querySelector('.main-header')).opacity,
        phpError: /Fatal error:|Warning:|Parse error:|Deprecated:/.test(text),
        tables: [...document.querySelectorAll('.main-article table')].every(table=>table.parentElement.classList.contains('table-scroll')),
        thumbnail: document.querySelector('.i-article-thumb img')?.getBoundingClientRect().width,
        inputFonts: [...document.querySelectorAll('.comment-container input')].map(element=>getComputedStyle(element).fontSize),
      };
    });
    const failures = [];
    if (result.scrollWidth > width) failures.push('page overflow');
    if (result.drawer !== (width < 1280)) failures.push('navigation breakpoint');
    if (result.phpError) failures.push('PHP error output');
    if (result.headerOpacity !== '1') failures.push('invisible header');
    if (!result.tables) failures.push('table not contained');
    if (result.inputFonts.some(size=>parseFloat(size) < 16)) failures.push('small form text');
    if (path === '/' && (result.left !== (width >= 1280) || result.right !== (width >= 1024))) failures.push('sidebar breakpoint');
    if (path === '/' && width < 768 && result.thumbnail !== 96) failures.push('thumbnail sizing');
    if (path === '/reading-test/' && result.mobileToc !== (width < 1280)) failures.push('TOC breakpoint');
    rows.push({path,...result,passed:!failures.length,failures});
  }
  return rows;
}

export async function runInteractions(tab, viewport) {
  const rows = [];
  const check = (name, passed, detail) => rows.push({name,passed,detail});
  await viewport.set({width:390,height:844});
  await tab.goto('http://127.0.0.1:9400/reading-test/');
  await tab.playwright.locator('.mobile-toc summary').click();
  await tab.playwright.locator('.mobile-toc a').nth(3).click();
  let state = await tab.playwright.evaluate(()=>({top:document.querySelector('#h22').getBoundingClientRect().top,header:document.querySelector('.main-header').getBoundingClientRect().bottom,open:document.querySelector('.mobile-toc').open,scroll:scrollY}));
  check('TOC closes and clears header', !state.open && state.top > state.header && state.top < state.header+40, state);
  const scrollBefore = state.scroll;
  await tab.playwright.locator('.daohang').click();
  state = await tab.playwright.evaluate(()=>({height:document.querySelector('#site-navigation').getBoundingClientRect().height,viewport:innerHeight,expanded:document.querySelector('.daohang').getAttribute('aria-expanded'),inert:document.querySelector('main').hasAttribute('inert'),locked:document.documentElement.classList.contains('nav-open'),focus:document.activeElement.className}));
  check('Full-height drawer, scroll lock and focus', state.height===state.viewport && state.expanded==='true' && state.inert && state.locked && state.focus==='nav-close', state);
  await tab.playwright.locator('.nav-close').press('Shift+Tab');
  state = await tab.playwright.evaluate(()=>({inside:document.querySelector('#site-navigation').contains(document.activeElement),focus:document.activeElement.className}));
  check('Drawer focus trap', state.inside && state.focus!=='nav-close', state);
  await tab.playwright.locator('#site-navigation .submenu-toggle').first().click();
  await tab.playwright.locator('#site-navigation .submenu-toggle').nth(1).click();
  const nested = await tab.playwright.locator('#site-navigation #site-submenu-1').isVisible();
  check('Two submenu levels expand', nested, nested);
  await tab.playwright.locator('.nav-close').press('Escape');
  state = await tab.playwright.evaluate(()=>({expanded:document.querySelector('.daohang').getAttribute('aria-expanded'),focus:document.activeElement.className,locked:document.documentElement.classList.contains('nav-open'),scroll:scrollY,inert:document.querySelector('main').hasAttribute('inert'),opacity:getComputedStyle(document.querySelector('.main-header')).opacity}));
  check('Escape restores focus, scroll and background',state.expanded==='false' && state.focus==='daohang' && !state.locked && !state.inert && state.scroll===scrollBefore && state.opacity==='1',state);
  await tab.playwright.locator('.daohang').click();
  await viewport.set({width:1440,height:900});
  state = await tab.playwright.evaluate(()=>({locked:document.documentElement.classList.contains('nav-open'),inert:document.querySelector('#site-navigation').hasAttribute('inert'),expanded:document.querySelector('.daohang').getAttribute('aria-expanded'),mainInert:document.querySelector('main').hasAttribute('inert')}));
  check('Desktop resize clears drawer state', !state.locked && !state.inert && state.expanded==='false' && !state.mainInert,state);
  await viewport.set({width:390,height:844});
  await tab.goto('http://127.0.0.1:9400/reading-test/?toc=off');
  check('Disabled catalogue stays disabled',await tab.playwright.locator('.mobile-toc').count()===0 && await tab.playwright.locator('#navigator').count()===0,'No catalogue DOM');
  await tab.goto('http://127.0.0.1:9400/?thumb=left');
  state=await tab.playwright.evaluate(()=>({summary:document.querySelector('.i-article-summary').getBoundingClientRect().left,image:document.querySelector('.i-article-thumb').getBoundingClientRect().left,overflow:document.documentElement.scrollWidth>innerWidth}));
  check('Left thumbnail configuration',state.image<state.summary && !state.overflow,state);
  await tab.goto('http://127.0.0.1:9400/');
  const count=await tab.playwright.locator('.i-article').count();
  await tab.playwright.locator('.loadnext').click();
  await tab.playwright.locator('.i-article').nth(count).waitFor({state:'visible'});
  const loaded=await tab.playwright.locator('.i-article').count();
  check('AJAX pagination adds articles',loaded>count,{before:count,after:loaded});
  await tab.playwright.locator('.daohang').click();
  await tab.playwright.getByRole('searchbox',{name:'搜索文章'}).fill('no-such-article-983471');
  await tab.playwright.getByRole('button',{name:'搜索',exact:true}).click();
  state=await tab.playwright.evaluate(()=>({query:location.search,width:innerWidth,documentWidth:document.documentElement.scrollWidth,text:document.body.innerText.includes('no-such-article-983471')}));
  check('Native search and empty state',state.query.includes('s=no-such-article-983471') && state.documentWidth<=state.width,state);
  await viewport.set({width:1440,height:900});
  await tab.goto('http://127.0.0.1:9400/?sidebars=off');
  state=await tab.playwright.evaluate(()=>({main:document.querySelector('.main-main').getBoundingClientRect().toJSON(),width:document.documentElement.clientWidth,sidebars:document.querySelectorAll('#space,#fixed').length}));
  check('Absent sidebars reserve no space',state.sidebars===0 && Math.abs((state.main.left+state.main.width/2)-state.width/2)<2,state);
  await tab.goto('http://127.0.0.1:9400/reading-test/');
  const reply = tab.playwright.locator('.comment-reply-link').first();
  await reply.click();
  state=await tab.playwright.evaluate(()=>({query:location.search,parent:document.querySelector('[name="comment_parent"]').value,top:document.querySelector('.comment-form').getBoundingClientRect().top}));
  check('Comment reply remains functional',state.query.includes('replytocom') && state.parent.trim()!=='' && state.top>=60,state);
  return rows;
}

export async function runDesktopDropdowns(tab, viewport) {
  const rows=[];
  for (const width of [1280,1440]) {
    await viewport.set({width,height:900});
    await tab.goto('http://127.0.0.1:9400/');
    await tab.playwright.locator('#site-navigation .menu > .menu-item-has-children > a').click();
    await tab.playwright.locator('#site-submenu-0').waitFor({state:'visible'});
    await tab.playwright.locator('#site-submenu-0 > .menu-item-has-children > a').press('ArrowDown');
    await tab.playwright.locator('#site-submenu-1').waitFor({state:'visible'});
    const state=await tab.playwright.evaluate(()=>({width:innerWidth,menus:[...document.querySelectorAll('#site-navigation .sub-menu')].map(element=>({left:element.getBoundingClientRect().left,right:element.getBoundingClientRect().right,visibility:getComputedStyle(element).visibility}))}));
    rows.push({...state,passed:state.menus.every(menu=>menu.left>=0 && menu.right<=width && menu.visibility==='visible')});
  }
  return rows;
}
