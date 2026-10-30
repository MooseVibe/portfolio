for(const phone of document.querySelectorAll('.payment-video-phone')){
 const video=phone.querySelector('video');
 const frame=phone.querySelector('.result-phone-frame');
 const scene=phone.querySelector('.result-phone-scene');
 let started=false,inView=false;
 const fit=new ResizeObserver(()=>{
  scene.style.setProperty('--phone-scale',Math.min(phone.clientWidth/614,phone.clientHeight/1230));
 });
 fit.observe(phone);
 function sync(){
  if(started&&inView&&!document.hidden)video.play().catch(()=>{});
  else video.pause();
 }
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   inView=entry.intersectionRatio>0;
   if(!inView){started=false;video.pause();video.currentTime=0;}
   else if(entry.intersectionRatio>=.8)started=true;
   sync();
  }
 },{threshold:[0,.8]});
 observer.observe(frame);
 video.addEventListener('canplay',sync);
 document.addEventListener('visibilitychange',sync);
 addEventListener('pagehide',()=>video.pause());
 addEventListener('pageshow',sync);
}
