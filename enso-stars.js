import {createNebula} from './assets/site/nebula/nebula.js';

const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
for(const host of document.querySelectorAll('.enso-media')){
 const layer=document.createElement('div');
 layer.className='enso-stars';layer.setAttribute('aria-hidden','true');host.prepend(layer);
 const nebula=createNebula(layer,{
  starsCount:190,starsColor:'#ffffff',starsRotationSpeed:.9,
  cometFrequence:0,nebulasIntensity:0,bgColor:'',
  sunScale:0,planetsScale:0,solarSystemOrbite:0,solarSystemSpeedOrbit:0
 });
 let visible=false;
 const sync=()=>{nebula.pause();if(visible&&!document.hidden&&!reduced)nebula.draw();};
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});
 observer.observe(host);sync();
 document.addEventListener('visibilitychange',sync);
 addEventListener('pagehide',()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);nebula.destroy();},{once:true});
}
