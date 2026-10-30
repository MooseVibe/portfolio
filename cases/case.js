let toastTimer;const toast=document.querySelector('#toast');
for(const button of document.querySelectorAll('.email'))button.addEventListener('click',async()=>{
 const email='Iliushka00@bk.ru';try{await navigator.clipboard.writeText(email);toast.textContent='Email скопирован';}catch{toast.textContent=email;}
 toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,3000);
});


const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
for(const details of document.querySelectorAll('details')){
 const summary=details.querySelector('summary');
 const body=document.createElement('div');
 body.className='details-body';
 body.setAttribute('data-glass-group','');
 details.setAttribute('data-glass-group','');
 while(summary.nextSibling)body.append(summary.nextSibling);
 details.append(body);
 let animation,fade,expanded=details.open;
 summary.addEventListener('click',event=>{
  event.preventDefault();
  const start=details.getBoundingClientRect().height;
  const opacity=getComputedStyle(body).opacity;
  animation?.cancel();fade?.cancel();
  expanded=!expanded;
  details.classList.toggle('is-expanded',expanded);
  if(reducedMotion.matches){details.open=expanded;details.classList.remove('is-animating');document.dispatchEvent(new Event('case-disclosure-settled'));return;}
  // Keep the body rendered until the closing animation finishes.
  details.open=true;
  const end=expanded?details.getBoundingClientRect().height:summary.getBoundingClientRect().height;
  details.classList.add('is-animating');
  const timing={duration:260,easing:'cubic-bezier(.2,0,.2,1)'};
  animation=details.animate([{height:`${start}px`},{height:`${end}px`}],timing);
  fade=body.animate([{opacity:expanded&&start<=summary.offsetHeight?0:opacity},{opacity:expanded?1:0}],timing);
  animation.onfinish=()=>{
   details.open=expanded;
   details.classList.remove('is-animating');
   animation=null;fade=null;
   document.dispatchEvent(new Event('case-disclosure-settled'));
  };
 });
 details.classList.toggle('is-expanded',expanded);
}

const mediaPreloader=new IntersectionObserver(entries=>{
 for(const {target,isIntersecting} of entries){
  if(!isIntersecting)continue;
  target.preload='auto';mediaPreloader.unobserve(target);
 }
},{rootMargin:'1200px 0px'});
for(const video of document.querySelectorAll('video'))mediaPreloader.observe(video);

const caseVideos=[...document.querySelectorAll('[data-case-video]')];
const chartPosters=new WeakMap(),playedCharts=new WeakSet();
const chartMotion=new IntersectionObserver(entries=>{
 for(const {target,intersectionRatio} of entries){
  if(intersectionRatio===0){
   if(playedCharts.delete(target))target.src=chartPosters.get(target);
   continue;
  }
  if(intersectionRatio<.7||playedCharts.has(target)||reducedMotion.matches)continue;
  playedCharts.add(target);
  const url=new URL(target.dataset.motionSrc,document.baseURI);
  // A fresh image document restarts the SVG timeline even when it was cached.
  url.searchParams.set('run',String(Date.now()));
  target.src=url.href;
 }
},{threshold:[0,.7]});
for(const image of document.querySelectorAll('img[data-motion-src]')){
 if(reducedMotion.matches){image.src=image.dataset.stillSrc;continue;}
 chartPosters.set(image,image.getAttribute('src'));
 chartMotion.observe(image);
}
if(caseVideos.length){
 const visible=new Set();
 const sync=video=>{
  if(visible.has(video)&&!document.hidden&&(video.readyState>=4||video.currentTime>0))video.play().catch(()=>{});
  else video.pause();
 };
 const observer=new IntersectionObserver(entries=>{
  for(const {target,isIntersecting,intersectionRatio} of entries){
   if(isIntersecting&&intersectionRatio>=.2)visible.add(target);else visible.delete(target);
   sync(target);
  }
 },{threshold:[0,.2]});
 for(const video of caseVideos){video.muted=true;video.addEventListener('canplaythrough',()=>sync(video));observer.observe(video);}
 document.addEventListener('visibilitychange',()=>caseVideos.forEach(sync));
}
