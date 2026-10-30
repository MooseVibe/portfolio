import * as THREE from 'three';
import {GLTFLoader} from './experiments/head/interactive/vendor/GLTFLoader.js';

function createEnsoMockup(host){
const video=host.querySelector('video');
const variant=host.dataset.flight||'arc';
const playbackThreshold=variant==='static'?.8:.4;
function setFlight(t){
 const ease=1-(1-t)**3;
 const remaining=1-ease;
 if(variant==='static'){
  pivot.position.set(0,.0816,0);
  pivot.rotation.set(0,0,0);
  pivot.scale.setScalar(1.2);
  return;
 }else{
  pivot.position.set(0,.0816-.2816*remaining+.055*Math.sin(Math.PI*ease),-.45*remaining);
  pivot.rotation.set(0,Math.PI*remaining,0);
 }
 pivot.scale.setScalar(1+.20*ease);
}
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
let visible=false,loaded=false,loading=false,renderer,pivot,scene,camera;
let elapsed=0,last=0,finished=false;
let drawnVideoTime=-1,needsRender=true;
const hasFrameCallback='requestVideoFrameCallback' in video;
let videoFrameCallback;
function onVideoFrame(){needsRender=true;videoFrameCallback=video.requestVideoFrameCallback(onVideoFrame);}
if(hasFrameCallback)videoFrameCallback=video.requestVideoFrameCallback(onVideoFrame);
host.dataset.intro='waiting';
const play=()=>video.play().catch(()=>{});
function prepareVideo(){
 video.preload='auto';
 if(video.readyState>=3)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const cleanup=()=>{clearTimeout(timer);video.removeEventListener('canplay',ready);video.removeEventListener('error',failed);};
  const ready=()=>{cleanup();resolve();};
  const failed=()=>{cleanup();reject(new Error('Video preparation failed'));};
  const timer=setTimeout(failed,20000);
  video.addEventListener('canplay',ready,{once:true});video.addEventListener('error',failed,{once:true});
  video.load();
 });
}
function frame(now){
 if(!visible||document.hidden){last=0;return;}
 // Once the phone has arrived, render only a new video frame or a resize.
 // This avoids redrawing 60 fps video at 120/144 Hz without dropping frames.
 if(finished&&!needsRender&&(hasFrameCallback||video.currentTime===drawnVideoTime))return;
 if(last)elapsed+=now-last;
 last=now;
 if(!finished){
  const t=reduced||variant==='static'?1:Math.min(elapsed/1800,1);
  setFlight(t);
  if(Math.abs(pivot.rotation.y)<THREE.MathUtils.degToRad(20)&&video.paused)play();
  if(t===1){finished=true;host.dataset.intro='complete';}
 }
 renderer.render(scene,camera);
 drawnVideoTime=video.currentTime;needsRender=false;
}
function sync(){
 last=0;needsRender=true;
 if(!loaded)return;
 const active=visible&&!document.hidden;
 if(active)host.dataset.intro=finished?'complete':'running';
 renderer.setAnimationLoop(active?frame:null);
 if(active&&finished)play();
 else if(!active)video.pause();
}
async function load(){
 if(loading)return;loading=true;
 try{
  const videoReady=prepareVideo();
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(28,1,.01,5);
  camera.position.set(0,.0816,.43);camera.lookAt(0,.0816,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0x666666,2));
  for(const [x,y,z,p] of [[-.15,.22,.2,3],[.15,.1,.1,2]]){const l=new THREE.DirectionalLight(0xffffff,p);l.position.set(x,y,z);scene.add(l);}
  pivot=new THREE.Group();scene.add(pivot);
  const [asset]=await Promise.all([new GLTFLoader().loadAsync('./experiments/enso-mockup/phone.glb'),videoReady]);
  const texture=new THREE.VideoTexture(video);texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;
  asset.scene.position.y=-.0816;
  asset.scene.traverse(o=>{if(o.isMesh&&o.name==='ENSO_Screen')o.material=new THREE.MeshBasicMaterial({map:texture});});
  pivot.add(asset.scene);video.currentTime=0;
  host.append(renderer.domElement);
  renderer.domElement.style.visibility='hidden';
  const bounds=host.getBoundingClientRect();renderer.setSize(bounds.width,bounds.height,false);camera.aspect=bounds.width/bounds.height;camera.updateProjectionMatrix();
  pivot.position.y=.0816;
  texture.needsUpdate=true;
  // Compile materials and upload the first video frame before the visible flight.
  if(renderer.compileAsync)await renderer.compileAsync(scene,camera);else renderer.compile(scene,camera);
  renderer.render(scene,camera);
  setFlight(0);
  renderer.render(scene,camera);
  renderer.domElement.style.visibility='';
  host.classList.add('has-phone');
  new ResizeObserver(()=>{const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();needsRender=true;}).observe(host);
  loaded=true;sync();
 }catch(error){renderer?.dispose();renderer?.domElement.remove();host.classList.remove('has-phone');host.dataset.intro='fallback';console.warn('ENSŌ: 3D недоступно',error);if(visible)play();}
}
const observer=new IntersectionObserver(entries=>{
 const entry=entries[entries.length-1];
 if(entry.isIntersecting&&!loading)load();
 if(!entry.isIntersecting){
  visible=false;elapsed=0;finished=false;last=0;video.pause();video.currentTime=0;
  if(host.dataset.intro!=='fallback')host.dataset.intro='waiting';
 }else if(entry.intersectionRatio>=playbackThreshold){
  visible=true;
  if(loaded&&host.dataset.intro!=='fallback')host.dataset.intro=finished?'complete':'running';
 }else visible=false;
 if(loaded)sync();else if(!visible)video.pause();else if(host.dataset.intro==='fallback')play();
},{threshold:[0,playbackThreshold]});
observer.observe(host);
const preloadObserver=new IntersectionObserver(entries=>{
 if(entries[0].isIntersecting){load();preloadObserver.disconnect();}
},{rootMargin:'1200px'});
preloadObserver.observe(host);
document.addEventListener('visibilitychange',sync);
addEventListener('pagehide',event=>{renderer?.setAnimationLoop(null);video.pause();if(!event.persisted){observer.disconnect();preloadObserver.disconnect();if(hasFrameCallback)video.cancelVideoFrameCallback(videoFrameCallback);}});
addEventListener('pageshow',event=>{if(event.persisted)sync();});

}
for(const host of document.querySelectorAll(".enso-media"))createEnsoMockup(host);
