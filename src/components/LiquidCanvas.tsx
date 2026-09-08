'use client';

import { glassFragment as fragment } from '@/lib/glass-shader';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';

export type LiquidControls = {
  camera: number; dissolve: number; organic: number; focus: number;
  pointerX: number; pointerY: number; impulse: number; paused: boolean; reduced: boolean;
  actProgress: number;
};

const vertex = `attribute vec2 aPosition;
void main(){ gl_Position=vec4(aPosition,0.,1.); }`;

export default function LiquidCanvas({ controls, layoutRef }: {controls: MutableRefObject<LiquidControls>;layoutRef: MutableRefObject<HTMLDivElement|null>}) {
  const ref=useRef<HTMLCanvasElement>(null);
  const [fallback,setFallback]=useState(false);
  useEffect(()=>{
    const canvas=ref.current!;
    const gl=(canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'high-performance'})
      || canvas.getContext('webgl',{alpha:false,antialias:true,powerPreference:'high-performance'})) as (WebGLRenderingContext|WebGL2RenderingContext|null);
    if(!gl){setFallback(true);return;}
    const compile=(type:number,source:string)=>{
      const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(shader));gl.deleteShader(shader);return null;}
      return shader;
    };
    const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
    if(!vs||!fs){setFallback(true);return;}
    const program=gl.createProgram()!;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){setFallback(true);return;}
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const getLoc=(name:string)=>gl.getUniformLocation(program,name)||gl.getUniformLocation(program,name.replace('[0]',''));
    const uniforms={
      uResolution:getLoc('uResolution'),
      uPointer:getLoc('uPointer'),
      uTime:getLoc('uTime'),
      uCamera:getLoc('uCamera'),
      uDissolve:getLoc('uDissolve'),
      uOrganic:getLoc('uOrganic'),
      uFocus:getLoc('uFocus'),
      uImpulse:getLoc('uImpulse'),
      uActProgress:getLoc('uActProgress'),
      uShapes:getLoc('uShapes[0]'),
      uKinds:getLoc('uKinds[0]'),
    };
    let width=1,height=1,raf=0,time=0,last=0,px=0,py=0,hidden=document.hidden;
    // CSS layout coordinates exclude transient GSAP transforms during viewport changes.
    const layoutOrigin=(element:HTMLElement)=>{
      let x=0,y=0;
      for(let node:HTMLElement|null=element;node;node=node.offsetParent as HTMLElement|null){
        x+=node.offsetLeft;y+=node.offsetTop;
      }
      return {x,y};
    };
    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      const dpr=Math.min(window.devicePixelRatio||1,1.55);
      const maxPixels=2800000;
      let scale=dpr;
      if(rect.width*rect.height*dpr*dpr>maxPixels){
        scale=Math.sqrt(maxPixels/(rect.width*rect.height));
      }
      width=Math.max(1,Math.floor(rect.width*scale));
      height=Math.max(1,Math.floor(rect.height*scale));
      canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);
      const shapes=new Float32Array(32),kinds=new Float32Array(8);
      const origin=layoutOrigin(canvas);
      layoutRef.current?.querySelectorAll<HTMLElement>('.glass-cell').forEach((el,i)=>{
        if(i>=8)return;
        const box=layoutOrigin(el),unit=4/rect.height;
        const left=box.x-origin.x,top=box.y-origin.y;
        shapes.set([(left+el.offsetWidth/2-rect.width/2)*unit,(rect.height/2-top-el.offsetHeight/2)*unit,el.offsetWidth/2*unit,el.offsetHeight/2*unit],i*4);
        kinds[i]=Number(el.dataset.glass||0);
      });
      if(uniforms.uShapes)gl.uniform4fv(uniforms.uShapes,shapes);
      if(uniforms.uKinds)gl.uniform1fv(uniforms.uKinds,kinds);
    };
    const observer=new ResizeObserver(resize);observer.observe(canvas);if(layoutRef.current)observer.observe(layoutRef.current);resize();
    let disposed=false;
    window.addEventListener('resize',resize);
    window.visualViewport?.addEventListener('resize',resize);
    document.fonts.ready.then(()=>{if(!disposed)resize();});
    const render=(now:number)=>{
      const dt=Math.min((now-last)/1000,.05);last=now;const c=controls.current;
      if(!hidden){
        if(!c.paused&&!c.reduced)time+=dt;
        px+=(c.pointerX-px)*.055;py+=(c.pointerY-py)*.055;
        if(uniforms.uResolution)gl.uniform2f(uniforms.uResolution,width,height);
        if(uniforms.uPointer)gl.uniform2f(uniforms.uPointer,c.reduced?0:px,c.reduced?0:py);
        if(uniforms.uTime)gl.uniform1f(uniforms.uTime,time);
        if(uniforms.uCamera)gl.uniform1f(uniforms.uCamera,c.camera);
        if(uniforms.uDissolve)gl.uniform1f(uniforms.uDissolve,c.dissolve);
        if(uniforms.uOrganic)gl.uniform1f(uniforms.uOrganic,c.organic);
        if(uniforms.uFocus)gl.uniform1f(uniforms.uFocus,c.focus);
        if(uniforms.uImpulse)gl.uniform1f(uniforms.uImpulse,c.impulse);
        if(uniforms.uActProgress)gl.uniform1f(uniforms.uActProgress,c.actProgress||0);
        gl.drawArrays(gl.TRIANGLES,0,6);
      }
      raf=requestAnimationFrame(render);
    };
    const visibility=()=>{hidden=document.hidden;};document.addEventListener('visibilitychange',visibility);
    const lost=(e:Event)=>{e.preventDefault();setFallback(true);cancelAnimationFrame(raf);};canvas.addEventListener('webglcontextlost',lost);
    raf=requestAnimationFrame(render);
    return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',lost);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);};
  },[controls,layoutRef,fragment]);
  return <><canvas ref={ref} className="liquid-canvas" aria-hidden="true"/>{fallback&&<div className="liquid-fallback" aria-hidden="true"/>}</>;
}


