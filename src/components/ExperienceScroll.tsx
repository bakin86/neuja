'use client';

import { useLayoutEffect, useRef, type MutableRefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './experience.css';

type Props={reduced:boolean;position:MutableRefObject<number>;onContact:()=>void};

export default function ExperienceScroll({reduced,position,onContact}:Props){
  const scroller=useRef<HTMLDivElement>(null);
  const stage=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const scroll=scroller.current!;
    scroll.scrollTop=position.current;
    scroll.focus({preventScroll:true});
    if(reduced)return;
    let disposed=false;
    const ctx=gsap.context(()=>{
      const reveal=(target:string,trigger:string)=>gsap.fromTo(target,{yPercent:110},{yPercent:0,duration:.85,stagger:.085,ease:'power4.out',scrollTrigger:{scroller:scroll,trigger,start:'top 78%',toggleActions:'play none none reverse'}});
      gsap.fromTo('.feeling-word',{yPercent:110},{yPercent:0,duration:.95,stagger:.09,ease:'power4.out',delay:.15});
      gsap.fromTo('.feeling-note',{opacity:0,y:18},{opacity:1,y:0,duration:.7,delay:.6});
      gsap.timeline({scrollTrigger:{scroller:scroll,trigger:'.feeling-section',start:'top top',end:'bottom bottom',scrub:.45,invalidateOnRefresh:true}})
        .to('.feeling-type',{yPercent:-28,scale:.86,ease:'none'},0)
        .to('.feeling-disc',{scale:7,ease:'power2.in'},.12)
        .to('.feeling-type,.feeling-note',{opacity:0,duration:.18},.58);

      const rail=stage.current!.querySelector<HTMLElement>('.poster-rail')!;
      gsap.to(rail,{x:()=>-(rail.scrollWidth-scroll.clientWidth),ease:'none',scrollTrigger:{scroller:scroll,trigger:'.horizontal-section',start:'top top',end:'bottom bottom',scrub:.45,invalidateOnRefresh:true}});
      gsap.timeline({scrollTrigger:{scroller:scroll,trigger:'.horizontal-section',start:'top top',end:'bottom bottom',scrub:.35}})
        .fromTo('.make-word',{scaleX:.78},{scaleX:1,duration:.3,ease:'power3.out'},0)
        .to('.make-disc',{yPercent:-55,rotation:90,duration:.5,ease:'none'},0)
        .fromTo('.move-word',{yPercent:100},{yPercent:0,duration:.22,ease:'power3.out'},.25)
        .fromTo('.move-pill',{scaleX:.12},{scaleX:1,rotation:-12,duration:.3,ease:'power3.inOut'},.3)
        .fromTo('.intent-word',{yPercent:100},{yPercent:0,duration:.25,ease:'power3.out'},.7);

      reveal('.journey-title .film-mask>span','.journey-section');
      const path=stage.current!.querySelector<SVGPathElement>('.journey-path')!;
      // Keep dash lengths in the same SVG coordinate space as the scaled path.
      const length=path.getTotalLength();
      gsap.set(path,{strokeDasharray:length,strokeDashoffset:length});
      const line=gsap.timeline({scrollTrigger:{scroller:scroll,trigger:'.journey-section',start:'top top',end:'bottom 120%',scrub:.3,invalidateOnRefresh:true}})
        .to(path,{strokeDashoffset:0,duration:1,ease:'none'},0);
      ['.waypoint-a','.waypoint-b','.waypoint-c'].forEach((name,i)=>{
        line.fromTo(name,{opacity:0,y:24},{opacity:1,y:0,duration:.16,ease:'power3.out'},[.12,.44,.77][i]);
      });
      line.to('.journey-end-dot',{scale:2.4,duration:.16,ease:'power2.in'},.87);

      reveal('.portal-title .film-mask>span','.through-section');
      gsap.timeline({scrollTrigger:{scroller:scroll,trigger:'.through-section',start:'top top',end:'bottom bottom',scrub:.5}})
        .to('.portal-aperture',{scale:12,duration:1,ease:'power2.inOut'},0)
        .to('.portal-title',{scale:2.5,opacity:0,duration:.45,ease:'power2.in'},.05)
        .fromTo('.through-copy',{opacity:0,y:25},{opacity:1,y:0,duration:.22,ease:'power3.out'},.62);
      reveal('.closing-title .film-mask>span','.closing-section');
      gsap.fromTo('.closing-action',{opacity:0,y:20},{opacity:1,y:0,duration:.7,scrollTrigger:{scroller:scroll,trigger:'.closing-section',start:'top 45%',toggleActions:'play none none reverse'}});
    },stage);
    ScrollTrigger.refresh();
    scroll.scrollTop=position.current;
    ScrollTrigger.update();
    document.fonts.ready.then(()=>{if(!disposed)ScrollTrigger.refresh();});
    return()=>{disposed=true;position.current=scroll.scrollTop;ctx.revert();};
  },[reduced,position]);

  return <div ref={scroller} className={`experience-scroll ${reduced?'motion-static':''}`} tabIndex={0} aria-label="Experience — scroll to explore" onScroll={e=>{position.current=e.currentTarget.scrollTop;}}>
    <div ref={stage} className="experience-film">
      <section className="feeling-section film-section" aria-label="From feeling to form">
        <div className="film-sticky feeling-poster">
          <h1 className="feeling-type"><span className="film-mask"><span className="feeling-word">A FEELING.</span></span><span className="film-mask"><span className="feeling-word">A FORM.</span></span></h1>
          <div className="feeling-disc" aria-hidden="true"/>
          <p className="feeling-note">Before the code, a little curiosity.<br/>Then, a different way of seeing.</p>
        </div>
      </section>

      <section className="horizontal-section film-section" aria-label="Make it move with intent">
        <div className="film-sticky horizontal-window">
          <div className="poster-rail">
            <article className="motion-poster make-poster"><h2 className="make-word">MAKE</h2><div className="make-disc" aria-hidden="true"><span/></div><p>An idea needs somewhere to go.</p></article>
            <article className="motion-poster move-poster"><h2><span className="film-mask"><span className="move-word">IT</span></span><span className="film-mask"><span className="move-word">MOVE.</span></span></h2><div className="move-pill" aria-hidden="true"/><p>Shape it. Break it. Find its rhythm.</p></article>
            <article className="motion-poster intent-poster"><h2><span className="film-mask"><span className="intent-word">WITH</span></span><span className="film-mask"><span className="intent-word">INTENT.</span></span></h2><div className="intent-arrow" aria-hidden="true">↗</div><p>Every movement has a reason.</p></article>
          </div>
        </div>
      </section>

      <section className="journey-section film-section" aria-label="The creative process">
        <div className="film-sticky journey-poster">
          <h2 className="journey-title"><span className="film-mask"><span>GOOD WORK TAKES</span></span><span className="film-mask"><span>A FEW TURNS.</span></span></h2>
          <div className="journey-drawing">
            <svg viewBox="0 0 1200 360" fill="none" aria-hidden="true" preserveAspectRatio="none"><path className="journey-path" d="M20 278 C130 264 272 215 238 187 C199 162 164 176 170 165 C174 147 348 149 365 160 C409 192 310 207 378 213 C462 215 637 161 620 198 C583 241 771 204 806 225 C873 269 906 315 935 233 C956 158 1119 231 1180 191" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
            <div className="waypoint waypoint-a"><h3>Curiosity</h3><p>Ask a better question.</p><i/></div>
            <div className="waypoint waypoint-b"><h3>Experiment</h3><p>Leave room for surprise.</p><i/></div>
            <div className="waypoint waypoint-c"><h3>Feeling</h3><p>Make it mean something.</p><i className="journey-end-dot"/></div>
          </div>
        </div>
      </section>

      <section className="through-section film-section" aria-label="An optical interlude">
        <div className="film-sticky through-poster">
          <div className="portal-aperture" aria-hidden="true"/>
          <h2 className="portal-title"><span className="film-mask"><span>LOOK</span></span><span className="film-mask"><span>CLOSER.</span></span></h2>
          <p className="through-copy">The detail makes<br/>the difference.</p>
        </div>
      </section>

      <section className="closing-section film-section" aria-label="Start a conversation">
        <div className="closing-poster">
          <h2 className="closing-title"><span className="film-mask"><span>LET’S MAKE</span></span><span className="film-mask"><span>SOMETHING</span></span><span className="film-mask"><span>MATTER.</span></span></h2>
          <div className="closing-action"><p>Your idea. My curiosity.</p><button onClick={onContact}>Let’s talk <span aria-hidden="true">↗</span></button></div>
        </div>
      </section>
    </div>
  </div>;
}

