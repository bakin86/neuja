# neuja — Code, with a pulse.

An interactive creative developer portfolio built with Next.js, TypeScript, GSAP and a custom WebGL shader.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. For a production preview, run `npm run build` and then `npm start`.

## The experience

- Short multilingual greeting, ending with Hello and an “I’m neuja” masked reveal.
- Camera pulls back with slow–fast–slow easing into the chromatic liquid surface.
- A capsule-and-circle poster composition with large blue typography. About, Experience and Contact are accessible from the optical surfaces and header.
- Five scroll-driven Experience sections: masked typography, horizontal posters, a drawn creative journey, an optical aperture and a closing invitation.
- Native scrolling and preserved scroll position when leaving and returning. No pause, chapter controls or progress HUD.
- Cursor response and click ripples; the glass geometry expands into content views.
- Responsive layouts, keyboard navigation, Escape to return, system reduced-motion support and a CSS fallback when WebGL is unavailable.

## Customize

`src/lib/content.ts` contains the profile of Dawaajargal (neuja), English biography, education, Instagram and phone number.

`src/components/LiquidCanvas.tsx` maps the layout into GPU geometry and manages rendering. `src/lib/glass-shader.ts` contains the custom optical glass and organic shader: beveled capsule SDFs, per-channel refraction, an internal-reflection fallback, studio highlights, and edge-concentrated chromatic color. It is a real-time artistic rendering, not a calibrated optical simulation. Rendering resolution is capped, time stops when the tab is hidden, and GPU resources are released on unmount.

`src/app/globals.css` contains typography, layout, responsive rules and secondary motion.

`src/components/ExperienceScroll.tsx` contains the example narrative and scoped GSAP ScrollTrigger sequences. `src/components/experience.css` handles the sticky poster layouts and static reduced-motion presentation. Experience scroll position stays in memory for this visit; it is not saved across reloads. Fonts currently use Google Fonts with local system fallbacks.

The Experience narrative is example copy. Contact links open the phone dialer or Instagram; no message is sent by this project.



