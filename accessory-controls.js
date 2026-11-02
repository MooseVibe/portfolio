import {playUISound} from './assets/site/ui-sounds.js';
const host=document.querySelector('#head-view');
const poster=document.querySelector('#head-poster');
const controls=document.querySelector('.accessories');
const glasses=document.querySelector('#glasses-toggle');
const hat=document.querySelector('#hat-toggle');
const previews={both:'assets/site/head-ready-both.webp',hat:'assets/site/head-ready-hat.webp',glasses:'assets/site/head-ready-glasses.webp',plain:'assets/site/head-ready-plain.webp'};
const showSelection=()=>{
 const g=glasses.getAttribute('aria-pressed')==='true',h=hat.getAttribute('aria-pressed')==='true';
 poster.src=new URL(previews[g?(h?'both':'glasses'):(h?'hat':'plain')],import.meta.url).href;
};
for(const [button,name] of [[glasses,'очки Ray-Ban'],[hat,'ковбойскую шляпу']])button.addEventListener('click',()=>{
 const on=button.getAttribute('aria-pressed')!=='true';
 button.setAttribute('aria-pressed',String(on));
 button.setAttribute('aria-label',`${on?'Снять':'Надеть'} ${name}`);
 showSelection();
 button.dispatchEvent(new Event('accessory-change'));
 playUISound('toggle');
});
Promise.allSettled(Object.values(previews).map(path=>{
 const image=new Image();image.fetchPriority='high';image.src=new URL(path,import.meta.url).href;return image.decode();
})).then(results=>{
 if(results.some(result=>result.status==='rejected')){window.resolvePortfolioAccessories?.();return;}
 showSelection();glasses.disabled=hat.disabled=false;
 controls.dataset.ready='true';
 window.resolvePortfolioAccessories?.();
});
