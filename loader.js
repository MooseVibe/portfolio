const overlay=document.querySelector('#site-loader');
if(overlay){
window.portfolioLoaderActive=true;
const number=overlay.querySelector('.loader-number');
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const waitImage=img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});});
const bounded=(promise,ms)=>Promise.race([promise,new Promise(resolve=>setTimeout(resolve,ms))]);
let fontsReady=false,imagesReady=false;
document.fonts.ready.then(()=>{fontsReady=true;});
// Returning to a case card never waits for fonts, images, video or 3D.
if(window.portfolioReturnTo){
 window.finishPortfolioLoading();
}else{
 const images=[...document.querySelectorAll('.site-header img,#head-poster,.accessory img')];
 const imageReady=Promise.all(images.map(waitImage)).then(()=>{imagesReady=true;});
 const preparation=Promise.allSettled([bounded(Promise.allSettled([document.fonts.ready,imageReady]),900),bounded(window.portfolioHeadReady,90000)]);
let ready=false;
preparation.then(()=>{ready=true;});
 const {createLoaderNumber}=await import('./loader-number.js?v=white-48').catch(()=>({createLoaderNumber:element=>({setProgress:value=>{element.textContent=String(Math.round(value));},settled:()=>Promise.resolve()})}));
 const counter=createLoaderNumber(number,reduced);
 let value=0;
 await new Promise(resolve=>{
  const tick=now=>{
   if(!overlay.isConnected)return resolve();
   // Finish as soon as the destination is prepared; never simulate extra loading.
   value=ready?100:Math.max(value,(fontsReady?5:0)+(imagesReady?5:0)+Math.min(85,Number(document.querySelector('#head-view')?.dataset.progress||0)*85));
   counter.setProgress(value,now);
   if(value===100)resolve();else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
 });
 await counter.settled();
 window.finishPortfolioLoading();
}

}
