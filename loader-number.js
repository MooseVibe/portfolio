import NumberFlow,{continuous,canAnimate} from './assets/site/number-flow/index.mjs';

export function createLoaderNumber(container,reduced){
 const flow=new NumberFlow();
 flow.format={maximumFractionDigits:0,useGrouping:false};
 flow.trend=1;flow.plugins=[continuous];flow.animated=!reduced;
 flow.transformTiming={duration:180,easing:'cubic-bezier(.22,1,.36,1)'};
 flow.spinTiming={duration:120,easing:'linear'};
 flow.opacityTiming={duration:180,easing:'ease-out'};
 flow.setAttribute('aria-hidden','true');
 container.replaceChildren(flow);flow.update(0);
 let shown=0,lastUpdate=0;
 return {
  setProgress(value,now){
   const next=Math.max(shown,Math.min(100,Math.floor(value)));
   if(next!==shown&&(now-lastUpdate>=120||next===100||reduced)){
    flow.update(next);shown=next;lastUpdate=now;
   }
  },
  settled(){
   if(reduced||!canAnimate)return Promise.resolve();
   return new Promise(resolve=>{
    const done=()=>{clearTimeout(timer);flow.removeEventListener('animationsfinish',done);resolve();};
    const timer=setTimeout(done,400);flow.addEventListener('animationsfinish',done,{once:true});
   });
  }
 };
}
