import {TextMorph} from './assets/site/torph/torph.mjs?v=scaled-preview-2';

const host=document.querySelector('[data-amounts-preview]');
if(host){
 const scene=host.querySelector('.amounts-scene');
 const wheel=host.querySelector('.amounts-wheel');
 const chip=host.querySelector('.amounts-chip--changing');
 const content=chip.querySelector('.amounts-chip-content');
 const label=content.querySelector('.amounts-morph');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const choices=[
  {text:'На распродажу 1 000 ₽',icon:'gamepad'},
  {text:'2 000 ₽',icon:'history'},
  {text:'Чтобы пришло ~100 ₽',icon:null},
  {text:'На кейсики 1 000 ₽',icon:'gamepad'},
  {text:'2 000 ₽',icon:'history'},
  {text:'На Battle Pass 1 000 ₽',icon:'gamepad'},
  {text:'Чтобы пришло ~100 ₽',icon:null},
  {text:'На аркану 1 000 ₽',icon:'gamepad'},
  {text:'2 000 ₽',icon:'history'},
  {text:'На новую игру 1 000 ₽',icon:'gamepad'},
  {text:'Чтобы пришло ~100 ₽',icon:null},
  {text:'На новый скин 1 000 ₽',icon:'gamepad'}
 ];
 const iconSlot=content.querySelector('.amounts-chip-icon');
 const icons={gamepad:'assets/site/tbank-gamepad.svg',history:'assets/site/tbank-arrow-clock.svg'};
 const choice=index=>choices[(index%choices.length+choices.length)%choices.length];
 const text=index=>choice(index).text.replaceAll(' ','\u00a0');
 // Explicit spaces keep glyph matching across the phrase; CSS preserves their width.
 const morphText=index=>choice(index).text.replaceAll(' ','\u2004');
 const setIcon=index=>{iconSlot.dataset.kind=choice(index).icon||'none';};
 const scales=[1.08,.62,.37,.22,.15],opacities=[1,.30,.07,0,0];
 const pose=position=>`translate(-50%,-50%) translateY(${position*85}px) rotateX(${-position*12}deg) scale(${scales[Math.min(4,Math.abs(position))]})`;
 const opacity=position=>opacities[Math.min(4,Math.abs(position))];
 let index=0,timer,visible=false,running=false,revision=0,morph;
 const animations=new Set();
 function paintWheel(){
  wheel.replaceChildren();
  for(let position=-3;position<=4;position++){
   const item=document.createElement('span');
   item.className='amounts-wheel-item';
   item.dataset.position=position;
   const kind=choice(index+position).icon;
   if(kind){const image=document.createElement('img');image.className='amounts-wheel-icon '+(kind==='gamepad'?'amounts-gamepad':'amounts-history');image.src=icons[kind];image.alt='';item.append(image);}
   const copy=document.createElement('span');copy.textContent=text(index+position);item.append(copy);
   item.style.transform=pose(position);item.style.opacity=opacity(position);
   wheel.append(item);
  }
 }
 function animate(element,keyframes,options){
  const animation=element.animate(keyframes,{...options,fill:'forwards'});
  animations.add(animation);
  return animation;
 }
 const done=animation=>animation.finished.catch(()=>{});
 function settleChip(){
  morph?.destroy();
  for(const animation of label.getAnimations({subtree:true}))animation.cancel();
  label.replaceChildren();
  morph=new TextMorph({element:label,locale:'ru',numbers:false,duration:760,ease:'cubic-bezier(.22,1,.36,1)'});
  setIcon(index);
  morph.update(morphText(index));
  chip.style.width='auto';
 }
 function stop(){
  clearTimeout(timer);running=false;revision++;
  for(const animation of animations)animation.cancel();animations.clear();
  paintWheel();settleChip();
 }
 async function advance(){
  if(!morph||!visible||document.hidden||reduced.matches)return;
  const token=revision;running=true;
  const next=index+1;
  const wheelAnimations=[...wheel.children].map(item=>{
   const position=Number(item.dataset.position);
   return animate(item,[{transform:pose(position),opacity:opacity(position)},{transform:pose(position-1),opacity:opacity(position-1)}],{duration:760,easing:'cubic-bezier(.22,1,.36,1)'});
  });
  // Torph animates the label width; flex carries the neighboring chips with it.
  setIcon(next);
  morph.update(morphText(next));
  await Promise.all(wheelAnimations.map(done));
  if(token!==revision)return;
  index=next;
  for(const animation of animations)animation.cancel();animations.clear();
  paintWheel();running=false;
  schedule();
 }
 function schedule(){
  clearTimeout(timer);
  if(visible&&!document.hidden&&!reduced.matches&&!running)timer=setTimeout(advance,1250);
 }
 const resize=new ResizeObserver(()=>{scene.style.transform=`scale(${host.clientWidth/1000})`;});
 resize.observe(host);
 paintWheel();
 document.fonts.ready.then(settleChip);
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   const next=entry.isIntersecting&&entry.intersectionRatio>=.35;
   if(next===visible)continue;
   visible=next;
   if(visible)schedule();else stop();
  }
 },{threshold:[0,.35]});
 const ready=window.portfolioLoading||Promise.resolve();
 ready.then(()=>observer.observe(host));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule();});
 reduced.addEventListener('change',()=>{stop();schedule();});
 addEventListener('pagehide',event=>{stop();if(!event.persisted){observer.disconnect();resize.disconnect();}});
 addEventListener('pageshow',event=>{if(event.persisted)schedule();});
}
