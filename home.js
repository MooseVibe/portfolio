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

// Animate four clipped gradients using compositor transforms, not SVG stroke repaint.
const circuit=document.querySelector('.grid-circuit');
const lanes=[...circuit.querySelectorAll('.circuit-lane i')];
let pulseAnimations=[];
const pulseSize=new ResizeObserver(()=>{
 if(!pulseAnimations.length)return;
 startPulse(pulseAnimations[0].currentTime);
});
function startPulse(time=0){
 for(const animation of pulseAnimations)animation.cancel();
 const {width,height}=circuit.getBoundingClientRect();
 const perimeter=2*(width+height);
 const horizontal=width/perimeter;
 const tail=perimeter*.072;
 circuit.style.setProperty('--pulse-tail',`${tail}px`);
 const stops=[
  [0,0],[10*horizontal,width],[10*horizontal+.5,width],
  [5.5,width+height],[6,width+height],
  [6+10*horizontal,2*width+height],[6.5+10*horizontal,2*width+height],
  [11.5,perimeter],[13.5,perimeter]
 ];
 const transforms=[
  distance=>`translate3d(${distance-tail}px,0,0)`,
  distance=>`translate3d(0,${distance-width-tail}px,0)`,
  distance=>`translate3d(${2*width+height-distance}px,0,0)`,
  distance=>`translate3d(0,${perimeter-distance}px,0)`
 ];
 pulseAnimations=lanes.map((lane,index)=>lane.animate(stops.map(([seconds,distance])=>({
  offset:seconds/13.5,transform:transforms[index](distance)
 })),{duration:13500,iterations:Infinity,easing:'linear'}));
 pulseAnimations.push(circuit.animate([
  {offset:0,opacity:1},{offset:11.5/13.5,opacity:1},
  {offset:11.6/13.5,opacity:0},{offset:1,opacity:0}
 ],{duration:13500,iterations:Infinity,easing:'linear'}));
 for(const animation of pulseAnimations)animation.currentTime=time;
}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 Promise.resolve(window.portfolioLoading).then(()=>{startPulse();pulseSize.observe(circuit);});
}
addEventListener('pagehide',event=>{if(!event.persisted){pulseSize.disconnect();for(const animation of pulseAnimations)animation.cancel();}});
