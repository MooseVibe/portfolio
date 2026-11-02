import {seregaGentle} from './assets/site/serega-gentle.js';
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
const loadHead=()=>import('./head.js?v=touch-75').catch(error=>{
 const host=document.querySelector('#head-view');
 host.dataset.loaded='fallback';host.dataset.arrival='near';
 document.querySelector('#head-poster').hidden=false;
 stage.classList.add('is-fallback','is-ready');
 document.querySelector('#glasses-toggle').disabled=true;
 document.querySelector('#hat-toggle').disabled=true;
 revealIntro();console.warn('Не удалось запустить 3D',error);
});
if(!window.portfolioReturnTo)loadHead();
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

const projectVideos=[...document.querySelectorAll('.project-media video')];
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
const framedVideos=new Map(projectVideos.map(video=>[
 video.closest('.steam-preview-phone, .enso-phone-2d, .project-media'),video
]));
const videoObserver=new IntersectionObserver(entries=>{
 for(const entry of entries){
  const video=framedVideos.get(entry.target);
  if(entry.intersectionRatio<=.2){
   visibleVideos.delete(video);
   video.pause();
   if(video.currentTime>0)video.currentTime=0;
  }else if(entry.intersectionRatio>=.8)visibleVideos.add(video);
 }
 syncProjectVideos();
},{threshold:[0,.2,.8]});
function syncProjectVideos(){
 for(const video of projectVideos){
  const buffered=video.readyState>=3;
  if(buffered&&visibleVideos.has(video)&&!document.hidden&&!document.documentElement.classList.contains('is-loading')&&!document.documentElement.classList.contains('is-returning'))video.play().catch(()=>{});else video.pause();
 }
}
for(const video of projectVideos){video.addEventListener('canplaythrough',syncProjectVideos);video.addEventListener('progress',syncProjectVideos);videoObserver.observe(video.closest('.steam-preview-phone, .enso-phone-2d, .project-media'));}
// Buffer upcoming media after the lightweight entrance is ready.
const preparedVideos=new Set();
function prepareVideo(target){
 if(preparedVideos.has(target))return;
 preparedVideos.add(target);
  target.addEventListener('canplay',syncProjectVideos,{once:true});
 target.preload='auto';if(target.readyState===0)target.load();
 syncProjectVideos();
}
const videoPreloader=new IntersectionObserver(entries=>{for(const {target,isIntersecting} of entries)if(isIntersecting){prepareVideo(target);videoPreloader.unobserve(target);}},{rootMargin:'500px 0px'});
window.portfolioLoading?.then(()=>{
 for(const video of projectVideos)videoPreloader.observe(video);
});
window.portfolioLoading?.then(syncProjectVideos);
document.addEventListener('visibilitychange',syncProjectVideos);
window.portfolioLoading?.then(()=>setTimeout(()=>{import('./enso-stars.js?v=2');},window.portfolioReturnTo?0:1000));
addEventListener('pagehide',event=>{if(!event.persisted){videoObserver.disconnect();videoPreloader.disconnect();}for(const video of projectVideos)video.pause();});
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

const ensoPhoneResize=new ResizeObserver(entries=>{for(const {target,contentRect} of entries)target.style.setProperty('--enso-scale',Math.min(contentRect.width/614,contentRect.height/1230));});
for(const phone of document.querySelectorAll('.enso-phone-2d'))ensoPhoneResize.observe(phone);
