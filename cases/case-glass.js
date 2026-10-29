import {LiquidGlass} from '../assets/site/liquidglass/index.js?v=animated-scene-4';

const header=document.querySelector('.paper-case .site-header');
const switcher=document.querySelector('.case-switcher');
if(header&&switcher){
 let previousY=Math.max(0,scrollY),travel=0;
 const syncHeader=()=>{
  const y=Math.max(0,scrollY),delta=y-previousY;
  previousY=y;
  header.classList.toggle('is-scrolled',y>0);
  if(y<=header.offsetHeight){
   header.classList.remove('is-hidden');travel=0;return;
  }
  if(!delta)return;
  travel=Math.sign(delta)===Math.sign(travel)?travel+delta:delta;
  if(Math.abs(travel)>=10){
   header.classList.toggle('is-hidden',travel>0&&!header.contains(document.activeElement));
   travel=0;
  }
 };
 document.addEventListener('focusin',event=>{
  if(header.contains(event.target))header.classList.remove('is-hidden');
 });
 syncHeader();
 addEventListener('scroll',syncHeader,{passive:true});
 // Dark Glass preset from the upstream demo; radii follow our UI geometry.
 const darkGlass={brightness:-.3,blurAmount:.4,floating:false};
 header.dataset.config=JSON.stringify({...darkGlass,cornerRadius:0,zRadius:12});
 switcher.dataset.config=JSON.stringify({...darkGlass,cornerRadius:26,zRadius:26});
 const selection=document.body.style.userSelect;
 const webkitSelection=document.body.style.webkitUserSelect;
 try{
  for(const group of document.querySelectorAll('main,.case-body,.case-section,.hypotheses-list,.hypothesis,.result-comparisons,.result-row,.result-copy,.case-columns,.case-column,.context-images,.final-flow>div,main p:has(img),.case-image,.image-link,.image-zoom-trigger,details,.details-body'))group.setAttribute('data-glass-group','');
  await document.fonts.ready;
  const glass=await LiquidGlass.init({root:document.body,glassElements:[header,switcher]});
  // The library disables selection on its root, but case text must stay copyable.
  document.body.style.userSelect=selection;
  document.body.style.webkitUserSelect=webkitSelection;
  header.classList.add('has-liquid-glass');
  switcher.classList.add('has-liquid-glass');
  let frame;
  const refresh=()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=null;glass.markChanged();});};
  addEventListener('scroll',refresh,{passive:true});
  document.addEventListener('case-disclosure-settled',refresh);
  for(const img of document.querySelectorAll('main img'))img.addEventListener('load',refresh,{once:true});
  addEventListener('pagehide',event=>{if(!event.persisted){cancelAnimationFrame(frame);glass.destroy();}},{once:true});
 }catch(error){
  console.warn('LiquidGlass unavailable; keeping CSS glass.',error);
 }finally{
  document.body.style.userSelect=selection;
  document.body.style.webkitUserSelect=webkitSelection;
 }
}
