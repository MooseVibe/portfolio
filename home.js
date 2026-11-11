const content=document.querySelector('.hero-content');
const center=document.querySelector('.hero-center');
const portrait=document.querySelector('.portrait-fit');
const stage=document.querySelector('.head-stage');
const fitHero=()=>{
 const portraitScale=Math.min(1,content.clientWidth/stage.offsetWidth);
 stage.style.setProperty('--portrait-scale',portraitScale);
 portrait.style.height=`${stage.offsetHeight*portraitScale}px`;
 const scale=Math.min(1,(center.clientHeight-32)/content.offsetHeight);
 content.style.setProperty('--hero-scale',Math.max(.1,scale));
};
const heroSize=new ResizeObserver(fitHero);
heroSize.observe(center);
heroSize.observe(content);
heroSize.observe(stage);
fitHero();
addEventListener('pagehide',event=>{if(!event.persisted)heroSize.disconnect();});
