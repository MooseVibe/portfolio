const overlay=document.querySelector('#site-loader');
window.portfolioLoaderActive=true;
const number=overlay.querySelector('.loader-number');
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const waitImage=img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});});
const bounded=(promise,ms)=>Promise.race([promise,new Promise(resolve=>setTimeout(resolve,ms))]);
const steam=document.querySelector('.steam-media video');
const previewReady=()=>!steam||steam.dataset.previewReady?Promise.resolve():bounded(new Promise(resolve=>{
 steam.addEventListener('preview-ready',resolve,{once:true});steam.addEventListener('error',resolve,{once:true});
}),3500);
let preparation;
let fontsReady=false,imagesReady=false;
document.fonts.ready.then(()=>{fontsReady=true;});
if(window.portfolioReturnTo){
 const project=document.getElementById(window.portfolioReturnTo)?.closest('.project');
 const images=[...(project?.querySelectorAll('img')||[])];
 for(const img of images)img.loading='eager';
 preparation=bounded(Promise.allSettled([document.fonts.ready,...images.map(waitImage),window.portfolioReturnTo==='steam-title'?previewReady():Promise.resolve()]),3500);
}else{
 const headReady=new Promise(resolve=>{
  const host=document.querySelector('#head-view');
  if(host.dataset.loaded||host.dataset.arrival)return resolve();
  let timeout;
  const check=()=>{
   clearTimeout(timeout);
   if(host.dataset.loaded||host.dataset.arrival){observer.disconnect();resolve();return;}
   // A slow download is still a healthy download while progress keeps arriving.
   timeout=setTimeout(()=>{observer.disconnect();resolve();},90000);
  };
  const observer=new MutationObserver(check);
  observer.observe(host,{attributes:true});
  check();
 });
 const images=[...document.querySelectorAll('.site-header img,#head-poster,.accessory img,.steam-media .video-cover,.steam-phone-frame')];
 const imageReady=Promise.all(images.map(waitImage)).then(()=>{imagesReady=true;});
 preparation=Promise.allSettled([document.fonts.ready,imageReady,headReady]);
}
let ready=false;
preparation.then(()=>{ready=true;});
// A cached return stays instant; a slow return uses this same counter, never another loader.
if(window.portfolioReturnTo)await Promise.race([preparation,new Promise(resolve=>setTimeout(resolve,160))]);
if(window.portfolioReturnTo&&ready)window.finishPortfolioLoading();
else{
 const {createLoaderNumber}=await import('./loader-number.js?v=white-48').catch(()=>({createLoaderNumber:element=>({setProgress:value=>{element.textContent=String(Math.round(value));},settled:()=>Promise.resolve()})}));
 const counter=createLoaderNumber(number,reduced);
 // Reveal a return loader only after its animated digits exist.
 if(window.portfolioReturnTo){
  document.documentElement.classList.remove('is-returning');
  document.documentElement.classList.add('is-loading');
 }
 let value=0;
 await new Promise(resolve=>{
  const tick=now=>{
   if(!overlay.isConnected)return resolve();
   // Finish as soon as the destination is prepared; never simulate extra loading.
   const progress=Number(document.querySelector('#head-view').dataset.progress||0);
   value=ready?100:Math.max(value,Math.min(95,progress*85+(fontsReady?5:0)+(imagesReady?5:0)));
   counter.setProgress(value,now);
   if(value===100)resolve();else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
 });
 await counter.settled();
 window.finishPortfolioLoading();
}
