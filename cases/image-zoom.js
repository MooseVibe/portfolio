const dialog=document.createElement('dialog');
dialog.className='case-lightbox';
dialog.setAttribute('aria-label','Увеличенное изображение');
const image=document.createElement('img');
dialog.append(image);
document.body.append(dialog);
let closing=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
async function close(){
 if(closing||!dialog.open)return;
 closing=true;
 dialog.classList.add('is-closing');
 if(!reduced.matches)await dialog.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.97)'}],{duration:140,easing:'ease-in'}).finished;
 dialog.close();
 document.documentElement.classList.remove('image-zoom-open');
 dialog.classList.remove('is-closing');
 closing=false;
}
dialog.addEventListener('click',close);
dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
for(const thumbnail of document.querySelectorAll('main img')){
 if(thumbnail.alt===''||thumbnail.closest('.eyebrow')||thumbnail.classList.contains('case-avatar'))continue;
 const link=thumbnail.closest('a');
 const trigger=link||document.createElement('button');
 if(!link){
  trigger.type='button';trigger.className='image-zoom-trigger';
  thumbnail.before(trigger);trigger.append(thumbnail);
 }
 trigger.classList.add('can-zoom');
 trigger.setAttribute('data-glass-group','');
 trigger.setAttribute('aria-haspopup','dialog');
 trigger.setAttribute('aria-label',`Увеличить: ${thumbnail.alt||'изображение'}`);
 trigger.removeAttribute('target');
 trigger.addEventListener('click',event=>{
  event.preventDefault();
  if(dialog.open)return;
  image.src=link?.href||thumbnail.currentSrc||thumbnail.src;
  image.alt=thumbnail.alt;
  document.documentElement.classList.add('image-zoom-open');
  dialog.showModal();
  if(!reduced.matches)dialog.animate([{opacity:0,transform:'scale(.96)'},{opacity:1,transform:'scale(1)'}],{duration:180,easing:'cubic-bezier(.2,0,.2,1)'});
 });
}
