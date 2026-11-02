// Request playback before waiting for media readiness: mobile browsers may defer preload.
export function createVideoPlayback(video,host){
 video.muted=true;video.defaultMuted=true;video.playsInline=true;
 let active=false,button;
 const playback=enabled=>{
  active=enabled;
  if(!active){video.pause();if(button)button.hidden=true;return;}
  if(!video.paused)return;
  Promise.resolve(video.play()).catch(error=>{
   if(error.name!=='NotAllowedError'||!active)return;
   if(!button){
    button=document.createElement('button');
    button.type='button';button.className='video-play-toggle';
    button.textContent='▶ Воспроизвести';
    button.setAttribute('aria-label','Воспроизвести видео');
    button.addEventListener('click',()=>playback(true));
    host.append(button);
   }
   button.hidden=false;
  });
 };
 video.addEventListener('playing',()=>{if(button)button.hidden=true;});
 return playback;
}
