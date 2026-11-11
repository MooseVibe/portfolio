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

// Match the corner holds to the actual perimeter so pauses land on the nodes.
const circuit=document.querySelector('.grid-circuit');
let pulseAnimations=[];
const pulseSize=new ResizeObserver(()=>{
 if(!pulseAnimations.length)return;
 const time=pulseAnimations[0].currentTime;
 startPulse(time);
});
function startPulse(time=0){
 for(const animation of pulseAnimations)animation.cancel();
 const {width,height}=circuit.getBoundingClientRect();
 const horizontal=width/(2*(width+height));
 const duration=13500;
 const stops=[
  [0,0],
  [10*horizontal,horizontal*100],
  [10*horizontal+.5,horizontal*100],
  [5.5,50],[6,50],
  [6+10*horizontal,50+horizontal*100],
  [6.5+10*horizontal,50+horizontal*100],
  [11.5,100],[13.5,100]
 ];
 pulseAnimations=[...circuit.querySelectorAll('.circuit-trace')].map(trace=>{
  const tail=parseFloat(trace.style.getPropertyValue('--tail-offset'));
  return trace.animate(stops.map(([seconds,position])=>({offset:seconds/13.5,strokeDashoffset:`${tail-position}px`})),{duration,iterations:Infinity,easing:'linear'});
 });
 pulseAnimations.push(circuit.querySelector('.circuit-pulse').animate([
  {offset:0,opacity:1},{offset:11.5/13.5,opacity:1},
  {offset:11.6/13.5,opacity:0},{offset:1,opacity:0}
 ],{duration,iterations:Infinity,easing:'linear'}));
 for(const animation of pulseAnimations)animation.currentTime=time;
}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 Promise.resolve(window.portfolioLoading).then(()=>{startPulse();pulseSize.observe(circuit);});
}
addEventListener('pagehide',event=>{if(!event.persisted){pulseSize.disconnect();for(const animation of pulseAnimations)animation.cancel();}});
