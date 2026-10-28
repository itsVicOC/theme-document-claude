export async function collectContrast(tab) {
  const samples = await tab.playwright.evaluate(() => {
    return [...document.querySelectorAll('body *')].filter(element => {
      const style = getComputedStyle(element);
      return !['SCRIPT','STYLE','NOSCRIPT'].includes(element.tagName) && !element.classList.contains('iconfont') && element.getBoundingClientRect().width > 0 && style.visibility !== 'hidden' && style.display !== 'none' && [...element.childNodes].some(node=>node.nodeType===3 && node.textContent.trim());
    }).map(element => {
      const style = getComputedStyle(element);
      const backgrounds=[];
      let parent=element;
      while(parent) { backgrounds.push(getComputedStyle(parent).backgroundColor); parent=parent.parentElement; }
      return {tag:element.tagName,classes:element.className,text:element.textContent.trim().slice(0,45),color:style.color,backgrounds,fontSize:style.fontSize,weight:style.fontWeight};
    });
  });
  const parse=color=>(color.match(/[\d.]+/g)||[]).map(Number);
  const blend=(front,back)=>{
    const alpha=front.length>3?front[3]:1;
    return front.slice(0,3).map((value,index)=>value*alpha+back[index]*(1-alpha));
  };
  const luminance=color=>color.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const seen=new Set();
  return samples.map(sample=>{
    const background=sample.backgrounds.slice().reverse().reduce((back,color)=>blend(parse(color),back),[255,255,255]);
    const foreground=blend(parse(sample.color),background);
    const values=[luminance(foreground),luminance(background)].sort((a,b)=>a-b);
    const ratio=(values[1]+.05)/(values[0]+.05);
    const target=parseFloat(sample.fontSize)>=24 || (parseFloat(sample.fontSize)>=18.66 && parseInt(sample.weight)>=700) ? 3 : 4.5;
    return {...sample,background,ratio:Math.round(ratio*100)/100,target,passed:ratio>=target};
  }).filter(sample=>{
    const key=[sample.color,sample.background.join(','),sample.target,sample.classes].join('|');
    if(seen.has(key)) return false;
    seen.add(key);return true;
  });
}
