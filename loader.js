const overlay=document.querySelector('#site-loader');
const number=overlay.querySelector('.loader-number');
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const waitImage=img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});});
const bounded=(promise,ms)=>Promise.race([promise,new Promise(resolve=>setTimeout(resolve,ms))]);
const steam=document.querySelector('.steam-media video');
const previewReady=()=>!steam||steam.dataset.previewReady?Promise.resolve():bounded(new Promise(resolve=>{
 steam.addEventListener('preview-ready',resolve,{once:true});steam.addEventListener('error',resolve,{once:true});
}),3500);
let preparation;
if(window.portfolioReturnTo){
 const project=document.getElementById(window.portfolioReturnTo)?.closest('.project');
 const images=[...(project?.querySelectorAll('img')||[])];
 for(const img of images)img.loading='eager';
 preparation=bounded(Promise.allSettled([document.fonts.ready,...images.map(waitImage),window.portfolioReturnTo==='steam-title'?previewReady():Promise.resolve()]),3500);
}else{
 const headReady=new Promise(resolve=>{
  const host=document.querySelector('#head-view');
  if(host.dataset.loaded||host.dataset.arrival)return resolve();
  const observer=new MutationObserver(()=>{if(host.dataset.loaded||host.dataset.arrival){observer.disconnect();resolve();}});
  observer.observe(host,{attributes:true});
  setTimeout(()=>{observer.disconnect();resolve();},8000);
 });
 const images=[...document.querySelectorAll('.site-header img,#head-poster,.accessory img,.steam-media .video-cover,.steam-phone-frame')];
 preparation=Promise.allSettled([document.fonts.ready,Promise.all(images.map(waitImage)),headReady,previewReady()]);
}
let ready=false;
preparation.then(()=>{ready=true;});
// A cached return stays instant; a slow return uses this same counter, never another loader.
if(window.portfolioReturnTo)await Promise.race([preparation,new Promise(resolve=>setTimeout(resolve,160))]);
if(window.portfolioReturnTo&&ready)window.finishPortfolioLoading();
else{
 const {createLoaderNumber}=await import('./loader-number.js?v=white-48');
 const counter=createLoaderNumber(number,reduced);
 // Reveal a return loader only after its animated digits exist.
 if(window.portfolioReturnTo){
  document.documentElement.classList.remove('is-returning');
  document.documentElement.classList.add('is-loading');
 }
 let value=0,last=performance.now();
 await new Promise(resolve=>{
  const tick=now=>{
   if(!overlay.isConnected)return resolve();
   const dt=Math.max(0,Math.min(now-last,40));last=Math.max(last,now);
   // Finish as soon as the destination is prepared; never simulate extra loading.
   value=ready?100:reduced?0:Math.min(95,value+dt*.05);
   counter.setProgress(value,now);
   if(value===100)resolve();else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
 });
 await counter.settled();
 window.finishPortfolioLoading();
}
