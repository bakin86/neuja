'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ExperienceScroll from '@/components/ExperienceScroll';
import LiquidCanvas, { type LiquidControls } from '@/components/LiquidCanvas';
import { profile } from '@/lib/content';

type View='home'|'about'|'experience'|'contact';

function Arrow({diagonal=false}:{diagonal?:boolean}) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal?'M6 18 18 6M6 6h12v12':'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function Portfolio(){
  const root=useRef<HTMLDivElement>(null);
  const posterRef=useRef<HTMLDivElement>(null);
  const introRef=useRef<HTMLDivElement>(null);
  const wordRef=useRef<HTMLSpanElement>(null);
  const introTimeline=useRef<gsap.core.Timeline|null>(null);
  const experiencePosition=useRef(0);
  const isNavigating=useRef(false);

  const controls=useRef<LiquidControls>({camera:5.2,dissolve:0,organic:0,focus:0,pointerX:0,pointerY:0,impulse:0,paused:false,reduced:false,actProgress:0});
  const [view,setView]=useState<View>('home');
  const [activeNav,setActiveNav]=useState<View>('home');
  const [intro,setIntro]=useState(true);

  const [reduced,setReduced]=useState(false);
  const [copied,setCopied]=useState(false);
  const [introKey,setIntroKey]=useState(0);
  const prevView=useRef<View>('home');
  const storyPanel=useRef<HTMLDivElement>(null);
  const headingRef=useRef<HTMLHeadingElement>(null);
  const copyTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const viewRef=useRef<View>('home');


  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>{setReduced(media.matches);controls.current.reduced=media.matches;};change();
    media.addEventListener('change',change);return()=>media.removeEventListener('change',change);
  },[]);

  useEffect(()=>{
    if(typeof window==='undefined')return;
    const params=new URLSearchParams(window.location.search);
    const v=params.get('view') as View;
    if(v && ['about','experience','contact'].includes(v)){
      introTimeline.current?.kill();
      controls.current.camera=4.8;
      setIntro(false);
      setView(v);
      setActiveNav(v);
    }
  },[]);

  useLayoutEffect(()=>{
    if(!intro)return;
    const params=new URLSearchParams(window.location.search);
    const v=params.get('view') as View;
    if(v && ['about','experience','contact'].includes(v)){
      setIntro(false);
      setView(v);
      setActiveNav(v);
      controls.current.camera=4.8;
      return;
    }
    const media=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const c=controls.current;c.camera=1.65;
    const ctx=gsap.context(()=>{
      gsap.set('.world',{opacity:0});gsap.set('.intro',{opacity:1,backgroundColor:'#111111'});
      gsap.set(wordRef.current,{yPercent:0,opacity:1});
      const tl=gsap.timeline({onComplete:()=>{setIntro(false);setActiveNav('home');}});introTimeline.current=tl;
      const greetings=media?['Hello']:['Сайн уу','こんにちは','Bonjour','Ciao','Hola','Hello'];
      greetings.forEach((word,i)=>{
        tl.call(()=>{if(wordRef.current)wordRef.current.textContent=word;},[],i*(media?.1:.25));
      });
      const end=media?.25:1.7;
      tl.to(wordRef.current,{yPercent:-115,duration:media?.1:.25,ease:'power2.in'},end)
        .call(()=>{if(wordRef.current)wordRef.current.textContent='I’m neuja';})
        .set(wordRef.current,{yPercent:110})
        .to(wordRef.current,{yPercent:0,duration:media?.1:.62,ease:'power3.out'})
        .addLabel('camera',media?'+=.12':'+=.42')
        .to('.world',{opacity:1,duration:media?.2:.4},'camera')
        .to('.intro',{backgroundColor:'rgba(17,17,17,0)',duration:media?.2:.85,ease:'power3.inOut'},'camera')
        .to(c,{camera:5.2,duration:media?.2:1.45,ease:'power3.inOut'},'camera')
        .to(wordRef.current,{scale:.42,opacity:0,duration:media?.2:1.1,ease:'power3.inOut'},'camera')
        .fromTo('.home-enter',{y:18,opacity:0},{y:0,opacity:1,duration:media?.15:.7,stagger:media?0:.065,ease:'power3.out'},'camera+=.8');
    },root);
    return()=>{ctx.revert();c.camera=5.2;introTimeline.current=null;};
  },[intro,introKey]);

  function finishIntro(){
    introTimeline.current?.progress(1);controls.current.camera=5.2;
    gsap.set('.world',{opacity:1});setIntro(false);setActiveNav('home');
  }

  function animateShader(targetView:View,targetChapter=0,isDive=false){
    const isExp=targetView==='experience';
    if(isDive){
      gsap.to(controls.current,{
        camera:1.35,
        dissolve:isExp?1.0:targetView==='home'?0:0.15,
        actProgress:isExp?targetChapter:0,
        duration:reduced?.1:.45,
        ease:'power2.in',
        overwrite:'auto',
        onComplete:()=>{
          gsap.to(controls.current,{
            camera:targetView==='home'?5.2:4.8,
            duration:reduced?.1:1.0,
            ease:'power3.out'
          });
        }
      });
    }else if(targetView==='home'){
      gsap.timeline({overwrite:'auto'})
        .to(controls.current,{
          camera:5.4,
          dissolve:0,
          actProgress:0,
          duration:reduced?.1:.65,
          ease:'power2.out'
        })
        .to(controls.current,{
          camera:5.2,
          duration:reduced?.05:.4,
          ease:'power2.inOut'
        });
    }else{
      gsap.to(controls.current,{
        dissolve:isExp?1.0:0.15,
        actProgress:isExp?targetChapter:0,
        camera:4.8,
        duration:reduced?.15:1.2,
        ease:'power3.inOut',
        overwrite:'auto'
      });
    }
  }

  useEffect(()=>{
    if(intro)return;
    viewRef.current=view;
    animateShader(view,0,false);
    if(view!==prevView.current){headingRef.current?.focus({preventScroll:true});prevView.current=view;}
  },[view,reduced,intro]);

  useLayoutEffect(()=>{
    if(view==='home'||view==='experience')return;
    const masks=storyPanel.current?.querySelectorAll<HTMLElement>('.line-mask');
    masks?.forEach(el=>{el.style.overflow='hidden';});

    const dir=1;

    const ctx=gsap.context(()=>{
      gsap.fromTo('.panel-reveal',
        {yPercent:dir>0?115:-115,opacity:0},
        {
          yPercent:0,
          opacity:1,
          duration:reduced?.1:.82,
          stagger:reduced?0:.075,
          ease:'power3.out',
          delay:reduced?0:.05,
          onComplete:()=>{
            masks?.forEach(el=>{el.style.overflow='visible';});
          }
        }
      );
      gsap.fromTo('.panel-detail',
        {y:reduced?0:(dir>0?18:-18),opacity:0},
        {y:0,opacity:1,duration:reduced?.1:.68,stagger:reduced?0:.045,delay:reduced?0:.16,ease:'power2.out'}
      );
      gsap.fromTo('.panel-top',
        {opacity:0,y:reduced?0:(dir>0?-10:10)},
        {opacity:1,y:0,duration:reduced?.1:.45,ease:'power2.out'}
      );

    },storyPanel);
    return()=>ctx.revert();
  },[view,reduced]);



  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){if(intro)finishIntro();else navigate('home');}
    };
    document.addEventListener('keydown',handler);
    return()=>document.removeEventListener('keydown',handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[intro]);
  useEffect(()=>()=>{if(copyTimer.current)clearTimeout(copyTimer.current);gsap.killTweensOf(controls.current);},[]);

  function navigate(next:View, originEl?:HTMLElement|null){
    if(next===viewRef.current||isNavigating.current)return;
    isNavigating.current=true;
    setActiveNav(next);

    const curView=viewRef.current;
    const isLeavingHome=curView==='home';

    gsap.fromTo(controls.current,{impulse:isLeavingHome?1.6:1.1},{impulse:0,duration:1.5,ease:'power2.out',overwrite:'auto'});

    animateShader(next,0,isLeavingHome);

    if(isLeavingHome&&originEl&&posterRef.current){
      const pBox=posterRef.current.getBoundingClientRect();
      const tBox=originEl.getBoundingClientRect();
      const cx=((tBox.left+tBox.width/2-pBox.left)/pBox.width)*100;
      const cy=((tBox.top+tBox.height/2-pBox.top)/pBox.height)*100;
      posterRef.current.style.transformOrigin=`${cx.toFixed(1)}% ${cy.toFixed(1)}%`;
    }else if(posterRef.current){
      posterRef.current.style.transformOrigin='50% 50%';
    }

    const dur=reduced?0.08:(isLeavingHome?0.42:0.32);

    const onExitComplete=()=>{

      setView(next);
      viewRef.current=next;

      requestAnimationFrame(()=>{
        if(next==='home'){
          gsap.fromTo('.home',
            {opacity:0},
            {opacity:1,duration:reduced?.1:.35,ease:'power2.out'}
          );
          if(posterRef.current){
            posterRef.current.style.transformOrigin='50% 50%';
          }
          gsap.fromTo('.poster-grid',
            {scale:reduced?1:1.15,opacity:0},
            {scale:1,opacity:1,duration:reduced?.1:.65,ease:'power3.out',clearProps:'transform,transformOrigin'}
          );
          gsap.fromTo('.poster-cell .home-enter, .poster-cell.cell-blue',
            {y:reduced?0:20,opacity:0,scale:reduced?1:.95},
            {
              y:0,opacity:1,scale:1,
              duration:reduced?.1:.55,
              stagger:reduced?0:.03,
              ease:'power3.out',
              clearProps:'transform,scale'
            }
          );
        }else{
          gsap.fromTo('.content-panel',
            {scale:reduced?1:1.05,opacity:0},
            {scale:1,opacity:1,duration:reduced?.1:.55,ease:'power3.out',clearProps:'transform'}
          );
        }
        setTimeout(()=>{
          isNavigating.current=false;
        },reduced?50:380);
      });
    };

    if(isLeavingHome){
      gsap.timeline({onComplete:onExitComplete})
        .to('.poster-grid',{
          scale:reduced?1:2.7,
          opacity:0,
          duration:dur,
          ease:'power2.in'
        })
        .to('.poster-cell .home-enter, .poster-cell.cell-blue',{
          opacity:0,
          scale:reduced?1:0.88,
          duration:dur*0.65,
          stagger:reduced?0:0.015,
          ease:'power2.in'
        },0)
        .to('.home',{opacity:0,duration:dur*0.85},0);
    }else{
      const masks=storyPanel.current?.querySelectorAll<HTMLElement>('.line-mask');
      masks?.forEach(el=>{el.style.overflow='hidden';});

      gsap.timeline({onComplete:onExitComplete})
        .to('.content-panel',{
          scale:reduced?1:0.94,
          opacity:0,
          y:reduced?0:-20,
          duration:dur,
          ease:'power2.in'
        })
        .to('.panel-reveal',{
          yPercent:-105,
          opacity:0,
          duration:dur*0.9,
          stagger:reduced?0:0.02,
          ease:'power2.in'
        },0)
        .to('.panel-detail, .panel-top, .scroll-indicator',{
          y:reduced?0:-14,
          opacity:0,
          duration:dur*0.8,
          stagger:reduced?0:0.02,
          ease:'power2.in'
        },0);
    }
  }
  async function copyPhone(){
    try{await navigator.clipboard.writeText(profile.phone);setCopied(true);if(copyTimer.current)clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopied(false),2000);}
    catch{setCopied(false);}
  }

  return <div ref={root} className={`portfolio view-${view} ${intro?'is-intro':''} ${reduced?'reduced-motion':''}`}
    onPointerMove={e=>{
      const w=window.innerWidth||1,h=window.innerHeight||1;
      controls.current.pointerX=(e.clientX/w-.5)*2;
      controls.current.pointerY=-(e.clientY/h-.5)*2;
    }}>
    <div className="world" inert={intro}>
      <LiquidCanvas controls={controls} layoutRef={posterRef}/>
      <header className="site-header home-enter">
        <button className="wordmark" onClick={(e)=>navigate('home',e.currentTarget)} aria-label="neuja home">neuja<span>®</span></button>
        <nav aria-label="Main navigation">
          {(['about','experience','contact'] as const).map(item=><button key={item} className={(activeNav===item||(activeNav==='home'&&view===item))?'active':''} onClick={(e)=>navigate(item,e.currentTarget)}>{item[0].toUpperCase()+item.slice(1)}<span className="nav-dot"/></button>)}
        </nav>
      </header>

      <main className="home" aria-label="Interactive portfolio" aria-hidden={view!=='home'} inert={view!=='home'}>
        <div className="poster-grid" ref={posterRef}>
          <button className="poster-cell glass-cell cell-about" data-glass="0" onClick={(e)=>navigate('about',e.currentTarget)}><span className="home-enter">About</span></button>
          <button className="poster-cell glass-cell cell-up" data-glass="1" onClick={(e)=>navigate('about',e.currentTarget)} aria-label="Explore About"><span className="home-enter"><Arrow diagonal/></span></button>
          <button className="poster-cell glass-cell cell-arrow" data-glass="1" onClick={(e)=>navigate('experience',e.currentTarget)} aria-label="Play the Experience story"><span className="home-enter"><svg viewBox="0 0 240 100" fill="none" aria-hidden="true"><path d="M14 50h211m-43-35 43 35-43 35" stroke="currentColor" strokeWidth="4"/></svg></span></button>
          <button className="poster-cell glass-cell cell-experience" data-glass="0" onClick={(e)=>navigate('experience',e.currentTarget)}><span className="home-enter">Experience</span></button>
          <div className="poster-cell cell-blue" aria-hidden="true"/>
          <button className="poster-cell glass-cell cell-contact" data-glass="0" onClick={(e)=>navigate('contact',e.currentTarget)}><span className="home-enter">Contact</span></button>
          <div className="poster-cell glass-cell cell-ring" data-glass="1" aria-hidden="true"/>
          <button className="poster-cell glass-cell cell-diagonal" data-glass="1" onClick={(e)=>navigate('contact',e.currentTarget)} aria-label="Say hello"><span className="home-enter"><Arrow diagonal/></span></button>
          <div className="poster-cell glass-cell cell-title" data-glass="0"><h1 className="home-enter">Creative<br/>developer.</h1></div>
        </div>
      </main>
      {view!=='home'&&<main ref={storyPanel} className={`content-panel ${view==='experience'?'experience-shell':''}`}>
        {view!=='experience'&&<div className="panel-top"><span>{view==='about'?'ABOUT ME':'03 / WHAT’S NEXT'}</span></div>}
        {view==='about'&&<div className="about-poster" lang="en">
          <div className="poster-margin-left panel-detail" aria-hidden="true">
            <span>{profile.fullName}</span>
            <span>{profile.role}</span>
          </div>
          <div className="poster-margin-right panel-detail" aria-hidden="true">
            <span>{'19 YEARS OLD'}</span>
            <span>NEUJA / DAWAAJARGAL</span>
          </div>

          <div className="poster-upright">
            <h1 className="poster-headline" ref={headingRef} tabIndex={-1}>
              <span className="line-mask"><span className="panel-reveal">CREATIVE</span></span>
              <span className="line-mask"><span className="panel-reveal">DEVEL—</span></span>
              <span className="line-mask line-indent"><span className="panel-reveal">—OPER</span></span>
            </h1>

            <div className="poster-columns panel-detail">
              <div className="poster-col">
                <span className="col-label">INTRODUCTION</span>
                <p>{profile.about}</p>
              </div>
              <div className="poster-col">
                <span className="col-label">FOCUS</span>
                <ul className="poster-list">
                  {profile.focus.map((item)=><li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="poster-col">
                <span className="col-label">EDUCATION</span>
                <p>{profile.education}</p>
                <span className="status-badge">GPA / 3.5</span>
              </div>
            </div>

            <div className="poster-date panel-detail">
              <span>{profile.year}</span>
              <button className="text-cta poster-cta" onClick={(e)=>navigate('experience',e.currentTarget)}>
                Step inside my process <Arrow/>
              </button>
            </div>
          </div>

          <div className="poster-inverted panel-detail" aria-hidden="true">
            <div className="poster-date-inverted">
              <span>{profile.year}</span>
            </div>
            <div className="poster-columns-inverted">
              <div className="poster-col">
                <span className="col-label">EDUCATION</span>
                <p>Indra Cyber Institute / Full-Stack Developer / 3.5 GPA.</p>
              </div>
              <div className="poster-col">
                <span className="col-label">FOCUS</span>
                <p>Creative frontend, motion and interactive web experiences.</p>
              </div>
            </div>
            <div className="poster-headline-inverted">
              <span>CREATIVE</span>
              <span>DEVEL—</span>
              <span className="line-indent">—OPER</span>
            </div>
          </div>
        </div>}
        {view==='experience'&&<ExperienceScroll reduced={reduced} position={experiencePosition} onContact={()=>navigate('contact')}/>} 
        {view==='contact'&&<div className="contact-content"><p className="eyebrow panel-detail">THE NEXT GOOD THING STARTS WITH A HELLO.</p>
          <h1 ref={headingRef} tabIndex={-1}><span className="line-mask"><span className="panel-reveal">Have a feeling?</span></span><span className="line-mask"><span className="panel-reveal">Let’s follow it.</span></span></h1>
          <div className="contact-email panel-detail"><a href={`tel:${profile.phoneHref}`}>{profile.phone}<Arrow diagonal/></a><button onClick={copyPhone} aria-label="Copy phone number">{copied?'Copied ✓':'Copy ↗'}</button></div>
          <p className="contact-note panel-detail">For interesting ideas, thoughtful collaborations,<br/>and things that don’t quite exist yet.</p>
          <a className="text-cta panel-detail" href={`https://www.instagram.com/${profile.instagram}/`} target="_blank" rel="noopener noreferrer">Instagram / @{profile.instagram} <Arrow diagonal/></a>
        </div>}
      </main>}

      <footer className="site-footer home-enter">
        <span>© {new Date().getFullYear()} neuja</span>
        {view==='home'&&<button onClick={()=>{setIntroKey(k=>k+1);setIntro(true);}}>Replay intro ↗</button>}
      </footer>
    </div>
    {intro&&<div ref={introRef} className="intro" role="status" aria-label="Welcome to neuja’s portfolio"><div className="intro-word-mask"><span ref={wordRef}>Сайн уу</span></div><span className="intro-corner">NEUJA — CREATIVE DEVELOPER</span><button className="skip-intro" onClick={finishIntro}>Skip intro <Arrow/></button></div>}
    <span className="sr-only" role="status">{copied?'Phone number copied to clipboard':''}</span>
  </div>;
}



