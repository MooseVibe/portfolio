const resize=new ResizeObserver(entries=>{
 for(const {target,contentRect} of entries){
  const scene=target.querySelector('.result-phone-scene');
  scene.style.setProperty('--phone-scale',Math.min(contentRect.width/614,contentRect.height/1230));
 }
});
for(const phone of document.querySelectorAll('.result-phone'))resize.observe(phone);
