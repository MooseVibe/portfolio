import {playUISound} from './assets/site/ui-sounds.js';
import * as THREE from 'three';
import {GLTFLoader} from './experiments/head/interactive/vendor/GLTFLoader.js';
import {MeshoptDecoder} from './experiments/head/interactive/vendor/meshopt_decoder.mjs';
const host=document.querySelector('#head-view'), poster=document.querySelector('#head-poster'),status=document.querySelector('#head-status');
const glassesButton=document.querySelector('#glasses-toggle'),hatButton=document.querySelector('#hat-toggle');
const stage=host.closest('.head-stage');
function announceArrival(){if(host.dataset.arrival)return;host.dataset.arrival='near';document.dispatchEvent(new Event('head-near'));}
function showFallback(){host.dataset.loaded='fallback';announceArrival();poster.hidden=false;stage.classList.add('is-fallback','is-ready');status.textContent='Статичный портрет';glassesButton.disabled=hatButton.disabled=true;}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch(error){showFallback();console.warn(error);}
if(renderer){
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;host.append(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,30);
scene.add(new THREE.HemisphereLight(0xffffff,0x7c7770,1.05));
const studio=new THREE.Scene();studio.background=new THREE.Color(0x555555);
for(const x of [-3,3]){const panel=new THREE.Mesh(new THREE.PlaneGeometry(2.5,4),new THREE.MeshBasicMaterial({color:0xdddddd}));panel.position.set(x,2,4);panel.lookAt(0,0,0);studio.add(panel);}
const pmrem=new THREE.PMREMGenerator(renderer),studioMap=pmrem.fromScene(studio);scene.environment=studioMap.texture;pmrem.dispose();
for(const [x,y,z,power] of [[-3,4,5,95],[3,1,4,35],[2,3,-3,45]]){const light=new THREE.DirectionalLight(0xffffff,power/40);light.position.set(x,y,z);scene.add(light);}
const loader=new GLTFLoader(),faces=[],target=new THREE.Vector2(),clarity={value:1},beardTone={value:1},reluctance={value:0};
loader.setMeshoptDecoder(MeshoptDecoder);
const downloads=new Map();
function modelProgress(name,bytes){return event=>{
 // Fetch reports decoded bytes, but Pages may send a compressed Content-Length.
 downloads.set(name,Math.min(1,event.loaded/bytes));
 host.dataset.progress=String([...downloads.values()].reduce((a,b)=>a+b,0)/3);
};}
const glassesAsset=loader.loadAsync('./experiments/head/interactive/glasses-web-v1.glb',modelProgress('glasses',1632372)).catch(error=>{glassesButton.disabled=true;console.warn('Очки не загрузились',error);return null;});
const hatAsset=loader.loadAsync('./experiments/head/interactive/hat-web-v1.glb',modelProgress('hat',2009704)).catch(error=>{hatButton.disabled=true;console.warn('Шляпа не загрузилась',error);return null;});
const pointer=new THREE.Vector2(),repulsion=new THREE.Vector2(),gazePoint=new THREE.Vector3();
let pointerActive=false,elapsed=0,ready=false;
let head,hat,glasses,distance=6.3;const center=new THREE.Vector3();
const accessoryMotions=[];
function prepareAccessory(model,offset){
 const pivot=new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
 const group=new THREE.Group();group.position.copy(pivot);model.position.sub(pivot);group.add(model);head.add(group);
 const motion={group,base:pivot,offset,from:1,to:1,value:1,time:0,duration:0};
 group.userData.motion=motion;accessoryMotions.push(motion);return group;
}
function accessories(animate=false){
 for(const [model,button] of [[hat,hatButton],[glasses,glassesButton]]){
  if(!model)continue;
  const m=model.userData.motion,on=button.getAttribute('aria-pressed')==='true';
  if(animate&&m.to===(on?1:0))continue;
  m.from=m.value;m.to=on?1:0;m.time=0;m.duration=animate&&!reduced?(on?.5:.18):0;
  if(!m.duration)m.value=m.to;
  model.visible=on||m.value>0;
 }
}
function updateAccessories(dt){
 for(const m of accessoryMotions){
  m.time+=dt;
  const t=m.duration?Math.min(m.time/m.duration,1):1;
  const ease=m.to===1?1-Math.pow(1-t,3)+Math.sin(t*Math.PI*2)*.07*(1-t):t*t*(3-2*t);
  m.value=t===1?m.to:THREE.MathUtils.lerp(m.from,m.to,ease);
  m.group.position.copy(m.base).addScaledVector(m.offset,1-m.value);
  // A small squash settles around the accessory itself, preserving its fitted position.
  const jelly=m.to===1&&t<1?Math.sin(t*Math.PI*4)*(1-t)*.035:0;
  const size=.94+.06*m.value;
  m.group.scale.set(size*(1+jelly),size*(1-jelly),size);
  m.group.visible=m.value>0||m.to===1;
 }
}
const accessoryPulses=new WeakMap();
function gelatine(button){
 if(reduced)return;
 accessoryPulses.get(button)?.cancel();
 accessoryPulses.set(button,button.animate([{opacity:0,scale:'1 1'},{opacity:1,scale:'.9 1.1',offset:.25},{opacity:1,scale:'1.1 .9',offset:.5},{opacity:1,scale:'.95 1.05',offset:.75},{opacity:1,scale:'1 1'}],{duration:500,easing:'ease'}));
}
for(const [button,name] of [[glassesButton,'очки Ray-Ban'],[hatButton,'ковбойскую шляпу']])button.addEventListener('click',()=>{const on=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',`${on?'Снять':'Надеть'} ${name}`);accessories(true);gelatine(button);playUISound('toggle');});
loader.loadAsync('./experiments/head/interactive/head-beard-web-v1.glb',modelProgress('head',5027132)).then(async gltf=>{
 head=gltf.scene;scene.add(head);
 head.traverse(o=>{if(!o.isMesh)return;if(o.morphTargetDictionary?.CheekDefinition!==undefined){faces.push(o);o.morphTargetInfluences[o.morphTargetDictionary.CheekDefinition]=1.25;}
 const m=o.material;if(!m.map)return;
m.map.anisotropy=renderer.capabilities.getMaxAnisotropy();
m.onBeforeCompile=shader=>{
shader.uniforms.clarity=clarity;
shader.uniforms.beardTone=beardTone;
shader.uniforms.reluctance=reluctance;
shader.uniforms.texel={value:new THREE.Vector2(1/m.map.image.width,1/m.map.image.height)};
shader.vertexShader='uniform float reluctance;\nvarying vec3 skinPosition;\n'+shader.vertexShader;
// The textured brows only need a tiny local movement; a full facial rig would be needed for larger expressions.
shader.vertexShader=shader.vertexShader.replace('#include <morphtarget_vertex>',`#include <morphtarget_vertex>
float brow=exp(-pow((abs(transformed.x)-0.28)/0.19,2.0)-pow((transformed.y-0.34)/0.085,2.0))*smoothstep(0.40,0.65,transformed.z);
transformed.y-=0.028*brow*reluctance;
transformed.x-=sign(transformed.x)*0.006*brow*reluctance;
skinPosition=transformed;`);
shader.fragmentShader='uniform float clarity;\nuniform float beardTone;\nuniform vec2 texel;\nvarying vec3 skinPosition;\n'+shader.fragmentShader;
const map=THREE.ShaderChunk.map_fragment.replace('diffuseColor *= sampledDiffuseColor;',`
vec3 neighbours=(texture2D(map,vMapUv+vec2(texel.x*2.0,0.0)).rgb+texture2D(map,vMapUv-vec2(texel.x*2.0,0.0)).rgb+texture2D(map,vMapUv+vec2(0.0,texel.y*2.0)).rgb+texture2D(map,vMapUv-vec2(0.0,texel.y*2.0)).rgb)*0.25;
vec3 crisp=sampledDiffuseColor.rgb+(sampledDiffuseColor.rgb-neighbours)*0.45;
crisp=(crisp-0.18)*1.10+0.18;
sampledDiffuseColor.rgb=mix(sampledDiffuseColor.rgb,clamp(crisp,0.0,1.0),clarity);
float beardMask=(1.0-smoothstep(-0.72,-0.55,skinPosition.y))*smoothstep(0.1,0.6,skinPosition.z)*(1.0-smoothstep(0.10,0.28,dot(sampledDiffuseColor.rgb,vec3(0.2126,0.7152,0.0722))));
sampledDiffuseColor.rgb=mix(sampledDiffuseColor.rgb,sampledDiffuseColor.rgb*0.85+vec3(0.027,0.017,0.009),beardMask*beardTone);
diffuseColor *= sampledDiffuseColor;`);
shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',map);
};m.needsUpdate=true;
});
const box=new THREE.Box3().setFromObject(head);box.getCenter(center);distance=box.getSize(new THREE.Vector3()).y/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)))*1.05;camera.position.set(center.x,center.y+.25,distance*1.35);camera.lookAt(center.x,center.y+.25,0);accessories();
await Promise.allSettled([
 glassesAsset.then(asset=>{if(!asset)return;glasses=asset.scene;glasses.traverse(o=>{if(o.isMesh){o.material.envMapIntensity=.65;if(o.material.name==='lambert1')o.material.roughness=.38;}});glasses=prepareAccessory(glasses,new THREE.Vector3(0,.015,.2));}),
 hatAsset.then(asset=>{if(!asset)return;hat=asset.scene;hat=prepareAccessory(hat,new THREE.Vector3(0,.24,0));})
]);
accessories();head.position.z=reduced?0:-14;
// Upload one texture per frame instead of blocking the first draw with every image.
const textures=new Set();
scene.traverse(object=>{
 for(const material of Array.isArray(object.material)?object.material:[object.material]){
  if(material)for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
 }
});
for(const texture of textures){
 renderer.initTexture(texture);
 await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
}
if(renderer.compileAsync)await renderer.compileAsync(scene,camera);
renderer.render(scene,camera);poster.hidden=true;
status.textContent='3D-портрет загружен';host.dataset.loaded='true';
if(window.portfolioLoading)await window.portfolioLoading;
ready=true;stage.classList.remove('is-fallback');stage.classList.add('is-ready');
}).catch(error=>{showFallback();console.warn('Не удалось загрузить 3D-портрет',error);});
function resize(){const {width,height}=host.getBoundingClientRect();camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);if(ready)renderer.render(scene,camera);}
new ResizeObserver(resize).observe(host);resize();
addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch')return;pointer.set(e.clientX,e.clientY);pointerActive=!e.target.closest('.accessories');});
function releasePointer(){pointerActive=false;target.set(0,0);}
document.documentElement.addEventListener('pointerleave',releasePointer);
addEventListener('blur',releasePointer);
addEventListener('scroll',releasePointer,{passive:true});
let visible=true;new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(host);
const clock=new THREE.Clock();renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);if(!ready||!visible||document.hidden)return;const ease=reduced?1:1-Math.exp(-8*dt);
if(head&&ready){
elapsed+=dt;
let proximity=0,awayX=0,awayY=0;
if(pointerActive&&!reduced&&elapsed>=1){
 const rect=host.getBoundingClientRect(),dx=pointer.x-(rect.left+rect.width/2),dy=pointer.y-(rect.top+rect.height*.56);
 const radius=rect.height*.58,d=Math.hypot(dx,dy);
 proximity=1-THREE.MathUtils.smoothstep(d,radius*.12,radius);
 // Measure from the resting position so the head cannot oscillate while escaping a stationary cursor.
 const length=Math.hypot(dx,dy,35);
 awayX=-dx/length*proximity;awayY=dy/length*proximity;
 // Gaze follows the cursor from the displaced head, independently of the escape direction.
 gazePoint.copy(center).add(head.position).project(camera);
 const gazeX=pointer.x-(rect.left+(gazePoint.x+1)*rect.width/2),gazeY=pointer.y-(rect.top+(1-gazePoint.y)*rect.height/2);
 target.set(THREE.MathUtils.clamp(gazeX/(rect.height*.65),-1,1),THREE.MathUtils.clamp(-gazeY/(rect.height*.65),-1,1));
}else target.set(0,0);
repulsion.x=THREE.MathUtils.lerp(repulsion.x,awayX,ease);
repulsion.y=THREE.MathUtils.lerp(repulsion.y,awayY,ease);
reluctance.value=THREE.MathUtils.lerp(reluctance.value,proximity,ease*.7);
const drift=reduced?0:Math.sin(elapsed*.72)*.005;
const bob=reduced?0:Math.sin(elapsed*1.22)*.018+Math.sin(elapsed*.61)*.003;
const flight=Math.min(elapsed/1,1),startScale=camera.position.z/(camera.position.z+14);
// Ease the apparent size, then convert it to depth so perspective cannot turn braking into acceleration.
const apparentScale=startScale+(1-startScale)*(1-Math.pow(1-flight,4));
const depth=reduced?0:camera.position.z*(1-1/apparentScale);
if(reduced||flight>=.45)announceArrival();
head.position.set(repulsion.x*.28+drift,repulsion.y*.22+bob,depth);
head.rotation.y=THREE.MathUtils.lerp(head.rotation.y,target.x*.18,ease);
head.rotation.x=THREE.MathUtils.lerp(head.rotation.x,-target.y*.10,ease);
head.rotation.z=reduced?0:Math.sin(elapsed*.72)*.004-repulsion.x*.035;
for(const face of faces)for(const [name,value] of [['LookX',target.x],['LookZ',target.y]]){const i=face.morphTargetDictionary[name];if(i!==undefined)face.morphTargetInfluences[i]=THREE.MathUtils.lerp(face.morphTargetInfluences[i],value,ease);}
}
updateAccessories(dt);
renderer.render(scene,camera);
});
}
