import {seregaGentle} from './assets/site/serega-gentle.js';
// Restore the destination before the return fade becomes visible.
const returnTo=window.portfolioReturnTo||new URLSearchParams(location.search).get('returnTo');
if(['steam-title','amounts-title'].includes(returnTo))window.portfolioLoading?.then(()=>{
 const target=document.getElementById(returnTo)?.closest('.project');
 if(!target)return;
 const url=new URL(location.href);url.searchParams.delete('returnTo');url.searchParams.delete('entry');url.hash=returnTo;
 history.replaceState({...history.state,portfolioReturnTo:returnTo},'',url.pathname+url.search+url.hash);
 target.scrollIntoView({behavior:'instant',block:'start'});
});
for(const id of ['steam-title','amounts-title']){
 const link=document.getElementById(id)?.closest('.project').querySelector('.project-link');
 link?.addEventListener('click',()=>history.replaceState({...history.state,portfolioReturnTo:id},'',location.href));
}
let toastTimer;const toast=document.querySelector('#toast');
for(const button of document.querySelectorAll('.email'))button.addEventListener('click',async()=>{
 const email='Iliushka00@bk.ru';try{await navigator.clipboard.writeText(email);toast.textContent='Email скопирован';}catch{toast.textContent=email;}
 toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,3000);
});

const textReveals=[],introText=[...document.querySelectorAll('.intro h1,.intro .tags>span,.intro p')];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const stage=document.querySelector('.head-stage');
let started=false;
const loadHead=()=>import('./head.js?v=entry-63').catch(error=>{
 const host=document.querySelector('#head-view');
 host.dataset.loaded='fallback';host.dataset.arrival='near';
 document.querySelector('#head-poster').hidden=false;
 stage.classList.add('is-fallback','is-ready');
 document.querySelector('#glasses-toggle').disabled=true;
 document.querySelector('#hat-toggle').disabled=true;
 revealIntro();console.warn('Не удалось запустить 3D',error);
});
if(!window.portfolioReturnTo)window.portfolioLoading.then(loadHead);
else{
 document.querySelector('#head-poster').hidden=false;
 stage.classList.add('is-fallback','is-ready');
 window.portfolioLoading.then(()=>requestAnimationFrame(()=>{
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){loadHead();observer.disconnect();}
  },{rootMargin:'300px'});
  observer.observe(document.querySelector('#head-view'));
 }));
}
if(!reducedMotion)for(const el of introText)el.style.visibility='hidden';
async function revealIntro(){
 if(window.portfolioLoading)await window.portfolioLoading;
 if(started)return;
 started=true;
 if(window.portfolioReturnTo){
  for(const el of introText)el.style.visibility='';
  stage.classList.add('bubbles-ready');return;
 }
 for(const el of introText){
  el.style.visibility='';
  const chip=el.parentElement.classList.contains('tags');
  const delay=chip?[...el.parentElement.children].indexOf(el)*90:0;
  textReveals.push(seregaGentle(el,{loop:false,initialDelay:delay}));
  if(chip&&!reducedMotion)el.animate([{opacity:0},{opacity:1}],{duration:500,delay,easing:'cubic-bezier(0.2, 0.8, 0.2, 1)',fill:'backwards'});
 }
 await Promise.all(textReveals.filter((_,index)=>introText[index].tagName!=='P').map(reveal=>reveal.finished));
 stage.classList.add('bubbles-ready');
}
if(window.portfolioReturnTo||reducedMotion||document.querySelector('#head-view').dataset.arrival==='near')revealIntro();
else document.addEventListener('head-near',revealIntro,{once:true});
window.portfolioLoading?.then(()=>{
 const host=document.querySelector('#head-view');
 if(host.dataset.loaded||host.dataset.arrival)return;
 document.querySelector('#head-poster').hidden=false;
 stage.classList.add('is-fallback','is-ready');
 document.querySelector('#glasses-toggle').disabled=true;
 document.querySelector('#hat-toggle').disabled=true;
 revealIntro();
});
addEventListener('pagehide',event=>{if(!event.persisted)for(const reveal of textReveals)reveal.stop();});

const projectVideos=[...document.querySelectorAll('.project-media:not(.enso-media) video')];
const steamVideo=document.querySelector('.steam-media video');
if(steamVideo){
 const cover=steamVideo.parentElement.querySelector('.video-cover');
 let revealed=false;
 const reveal=()=>{
  if(revealed)return;revealed=true;
  if(cover){cover.classList.add('is-decoded');setTimeout(()=>{cover.hidden=true;},240);}
  steamVideo.dataset.previewReady='true';
  steamVideo.dispatchEvent(new Event('preview-ready'));
 };
 // A seek event can precede presentation; keep the poster until a decoded frame is delivered.
 if('requestVideoFrameCallback' in steamVideo)steamVideo.requestVideoFrameCallback(reveal);
 else steamVideo.addEventListener('seeked',()=>requestAnimationFrame(()=>requestAnimationFrame(reveal)),{once:true});
 const preparePreview=()=>{if(steamVideo.paused&&steamVideo.currentTime===0)steamVideo.currentTime=.001;};
 if(steamVideo.readyState>=2)preparePreview();
 else steamVideo.addEventListener('loadeddata',preparePreview,{once:true});
}
const visibleVideos=new Set();
const videoResetTimers=new Map();
const videoObserver=new IntersectionObserver(entries=>{
 for(const entry of entries){
  const video=entry.target;
  if(video.closest('.misa-media')){
   if(entry.isIntersecting){
    clearTimeout(videoResetTimers.get(video));
    videoResetTimers.delete(video);
   }else if(!videoResetTimers.has(video)){
    videoResetTimers.set(video,setTimeout(()=>{
     videoResetTimers.delete(video);
     if(video.currentTime>0)video.currentTime=0;
    },2000));
   }
  }
  const threshold=Number(video.dataset.playThreshold||.35);
  if(entry.isIntersecting&&entry.intersectionRatio>=threshold)visibleVideos.add(entry.target);else visibleVideos.delete(entry.target);
  if(!entry.isIntersecting&&entry.target===steamVideo){
   steamVideo.pause();
   if(steamVideo.currentTime>0)steamVideo.currentTime=0;
  }
 }
 syncProjectVideos();
},{threshold:[0,.35,.85,.9]});
function syncProjectVideos(){
 for(const video of projectVideos){
  const buffered=video.readyState>=4||video.currentTime>0;
  if(buffered&&visibleVideos.has(video)&&!document.hidden&&!document.documentElement.classList.contains('is-loading')&&!document.documentElement.classList.contains('is-returning'))video.play().catch(()=>{});else video.pause();
 }
}
for(const video of projectVideos){video.addEventListener('canplaythrough',syncProjectVideos);videoObserver.observe(video);}
// Start buffering nearby sections after the portrait has finished downloading.
const videoPreloader=new IntersectionObserver(entries=>{
 for(const {target,isIntersecting} of entries){
  if(!isIntersecting)continue;
  target.addEventListener('canplay',syncProjectVideos,{once:true});
  target.preload='auto';if(target.readyState===0)target.load();videoPreloader.unobserve(target);
  syncProjectVideos();
 }
},{rootMargin:'1200px 0px'});
window.portfolioLoading?.then(()=>{
 for(const video of projectVideos)if(video.preload==='none')videoPreloader.observe(video);
});
window.portfolioLoading?.then(syncProjectVideos);
document.addEventListener('visibilitychange',syncProjectVideos);
window.portfolioLoading?.then(()=>setTimeout(()=>{import('./enso.js?v=network-58');import('./enso-stars.js?v=2');},window.portfolioReturnTo?0:1000));
addEventListener('pagehide',event=>{if(!event.persisted){videoObserver.disconnect();videoPreloader.disconnect();}for(const timer of videoResetTimers.values())clearTimeout(timer);videoResetTimers.clear();for(const video of projectVideos)video.pause();});
addEventListener('pageshow',event=>{if(event.persisted)syncProjectVideos();});
const steamPhone=document.querySelector('.steam-preview-phone');
if(steamPhone){
 const resize=new ResizeObserver(entries=>{
  for(const {target,contentRect} of entries){
   target.querySelector('.steam-phone-scene').style.setProperty('--steam-phone-scale',Math.min(contentRect.width/614,contentRect.height/1230));
  }
 });
 resize.observe(steamPhone);
 addEventListener('pagehide',event=>{if(!event.persisted)resize.disconnect();});
}
