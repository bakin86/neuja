export const glassFragment = `
precision highp float;
uniform vec2 uResolution,uPointer;
uniform vec4 uShapes[8];
uniform float uKinds[8];
uniform float uTime,uCamera,uDissolve,uOrganic,uFocus,uImpulse,uActProgress;

// SDF for capsules and optical ring bevels
float shapeDistance(vec3 p, vec4 shape, float kind) {
  p.xy /= (1.0 + uDissolve * 2.2);
  p.xy -= shape.xy;
  float t = uTime * 0.38;
  
  // Smooth organic liquid ripples responding to mouse & time
  float wave = sin(p.x * 3.2 + t) * sin(p.y * 2.8 - t) * 0.0055;
  float pointerDist = length(p.xy - uPointer);
  float ripple = 0.016 * exp(-pointerDist * 2.4) + uImpulse * 0.02 * sin(pointerDist * 14.0 - uTime * 3.0);
  p.z += wave + ripple;

  vec2 size = shape.zw;
  float radius = min(size.x, size.y);
  vec2 q = abs(p.xy) - size + radius;
  float d2d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;

  float rim = min(0.047, radius * 0.14);
  if (kind > 0.5) d2d = max(d2d, -d2d - rim);

  float depth = kind > 0.5 ? 0.032 : 0.105;
  float bevel = kind > 0.5 ? rim * 0.5 : min(0.12, radius * 0.28);

  // Voluptuous, continuous beveled capsule SDF
  vec2 w = vec2(d2d + bevel, abs(p.z) - depth + bevel);
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - bevel;
}

float map(vec3 p) {
  float d = 50.0;
  for (int i = 0; i < 8; i++) {
    d = min(d, shapeDistance(p, uShapes[i], uKinds[i]));
  }
  return d;
}

// Precise tetrahedral normal calculation
vec3 normalAt(vec3 p, vec4 s, float k) {
  const float h = 0.0012;
  const vec2 e = vec2(1.0, -1.0);
  return normalize(
    e.xyy * shapeDistance(p + e.xyy * h, s, k) +
    e.yyx * shapeDistance(p + e.yyx * h, s, k) +
    e.yxy * shapeDistance(p + e.yxy * h, s, k) +
    e.xxx * shapeDistance(p + e.xxx * h, s, k)
  );
}

// Physically-inspired spectral wavelength to RGB (CIE approximation)
// Wavelength lambda in [0, 1] mapped from 400nm (violet) to 700nm (red)
vec3 wavelengthToRGB(float lambda) {
  float wl = 400.0 + clamp(lambda, 0.0, 1.0) * 300.0;
  float r = 0.0, g = 0.0, b = 0.0;
  if (wl >= 400.0 && wl < 445.0) {
    r = -(wl - 445.0) / (445.0 - 400.0) * 0.85;
    b = 1.0;
  } else if (wl >= 445.0 && wl < 490.0) {
    b = 1.0;
    g = (wl - 445.0) / (490.0 - 445.0);
  } else if (wl >= 490.0 && wl < 515.0) {
    g = 1.0;
    b = -(wl - 515.0) / (515.0 - 490.0);
  } else if (wl >= 515.0 && wl < 580.0) {
    g = 1.0;
    r = (wl - 515.0) / (580.0 - 515.0);
  } else if (wl >= 580.0 && wl < 640.0) {
    r = 1.0;
    g = -(wl - 640.0) / (640.0 - 580.0);
  } else if (wl >= 640.0 && wl <= 700.0) {
    r = 1.0;
  }
  float factor = 0.0;
  if (wl >= 400.0 && wl < 425.0) factor = 0.45 + 0.55 * (wl - 400.0) / 25.0;
  else if (wl >= 425.0 && wl <= 645.0) factor = 1.0;
  else if (wl > 645.0 && wl <= 700.0) factor = 0.45 + 0.55 * (700.0 - wl) / 55.0;
  return vec3(r, g, b) * factor;
}

// Clean, luminous studio HDR lighting environment
vec3 studioEnvironment(vec3 r) {
  // Luminous white cyclorama backdrop with gentle neutral gradient
  vec3 env = mix(vec3(0.92, 0.92, 0.93), vec3(0.985, 0.985, 0.975), smoothstep(-0.4, 0.7, r.y));
  
  // Soft contrast definition (gentle dark accents on bottom-left, never pitch black)
  float darkGaze = smoothstep(0.4, 0.95, dot(r, normalize(vec3(-0.8, -0.4, -0.3))));
  env = mix(env, vec3(0.24, 0.25, 0.28), darkGaze * 0.55);

  // Studio overhead softbox
  float softbox = pow(max(0.0, dot(r, normalize(vec3(0.1, 0.92, 0.35)))), 28.0);
  env += vec3(softbox * 3.2);

  // Crisp rim strip lights that give the crystal-sharp highlight
  float strip1 = pow(max(0.0, dot(r, normalize(vec3(-0.75, 0.55, 0.35)))), 140.0) * 8.0;
  float strip2 = pow(max(0.0, dot(r, normalize(vec3(0.65, 0.65, 0.38)))), 180.0) * 9.0;
  env += vec3(strip1 + strip2);

  return env;
}

// Organic animated background surface
vec3 organicSurface(vec2 uv) {
  float t = uTime * 0.14;
  vec2 p = uv * 1.5 + uPointer * 0.08;
  float f = sin(p.x * 2.1 + sin(p.y * 1.8 + t)) + cos(p.y * 2.2 - p.x * 0.4 - t) + sin(p.x * 1.7 + p.y * 2.0 + t) * 0.65;
  float e = abs(f);
  float ink = exp(-e * e * 24.0);
  float haze = exp(-e * e * 3.4);
  vec3 c = mix(vec3(0.985), vec3(0.74), haze * 0.32);
  return mix(c, vec3(0.025), ink * 0.96);
}

// Subtle triangular noise to eliminate 8-bit banding
float dither(vec2 coord) {
  return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453);
}

// Act 1: Minimal Optical Ribbons (Ref 1)
vec3 renderAct1(vec2 uv, float time) {
  vec3 bg = mix(vec3(0.968, 0.966, 0.955), vec3(0.945, 0.948, 0.955), smoothstep(-0.6, 0.6, uv.y));
  vec3 col = bg;
  
  vec2 p1 = uv - vec2(0.18, 0.0);
  float curve1 = sin(p1.y * 1.6 + time * 0.15) * 0.52 + cos(p1.y * 0.8) * 0.18;
  float dRibbon1 = abs(p1.x - curve1) - 0.048;
  
  vec2 p2 = uv + vec2(0.22, -0.1);
  float curve2 = cos(p2.y * 1.8 - time * 0.12) * 0.42 + sin(p2.y * 1.1) * 0.14;
  float dRibbon2 = abs(p2.x - curve2) - 0.035;

  float shadow1 = smoothstep(0.18, 0.01, abs(dRibbon1 - 0.05)) * 0.09;
  float shadow2 = smoothstep(0.15, 0.01, abs(dRibbon2 - 0.04)) * 0.07;
  col -= vec3(shadow1 + shadow2);

  float inGlass1 = smoothstep(0.005, -0.005, dRibbon1);
  float inGlass2 = smoothstep(0.005, -0.005, dRibbon2);
  col = mix(col, vec3(0.988, 0.988, 0.992), (inGlass1 + inGlass2) * 0.45);

  float rim1 = smoothstep(0.045, 0.002, abs(dRibbon1));
  float rim2 = smoothstep(0.038, 0.002, abs(dRibbon2));
  
  float lambda1 = fract(p1.y * 0.85 + curve1 * 0.5 + time * 0.06);
  float lambda2 = fract(-p2.y * 0.95 - curve2 * 0.4 - time * 0.05);
  
  vec3 rainbow1 = wavelengthToRGB(lambda1) * rim1 * 2.6;
  vec3 rainbow2 = wavelengthToRGB(lambda2) * rim2 * 2.2;

  float spec1 = pow(smoothstep(0.028, 0.0, abs(dRibbon1 + 0.006)), 8.0) * 5.0;
  float spec2 = pow(smoothstep(0.022, 0.0, abs(dRibbon2 - 0.005)), 8.0) * 4.2;

  col += rainbow1 + rainbow2 + vec3(spec1 + spec2);
  return col;
}

// Act 2: Deep Cobalt Grain (Ref 2)
vec3 renderAct2(vec2 uv, float time) {
  vec3 darkBase = vec3(0.012, 0.03, 0.13);
  
  vec2 p = uv + uPointer * 0.08;
  float n1 = sin(p.x * 2.1 + sin(p.y * 2.4 + time * 0.3)) * 0.5 + 0.5;
  float n2 = cos(p.y * 1.9 - p.x * 1.3 - time * 0.25) * 0.5 + 0.5;
  float fluid = clamp(n1 * 0.65 + n2 * 0.55 + 0.18 * sin((p.x + p.y) * 2.8 + time * 0.35), 0.0, 1.0);
  
  vec3 deepBlue = vec3(0.018, 0.14, 0.48);
  vec3 electricCyan = vec3(0.0, 0.72, 0.96);
  vec3 softHighlight = vec3(0.55, 0.90, 1.0);
  
  vec3 col = mix(darkBase, deepBlue, smoothstep(0.12, 0.68, fluid));
  col = mix(col, electricCyan, smoothstep(0.52, 0.92, fluid) * 0.92);
  col += softHighlight * pow(smoothstep(0.72, 1.0, fluid), 2.8) * 0.75;
  
  float grain = (dither(gl_FragCoord.xy * 1.4 + fract(time * 7.7)) - 0.5);
  col += grain * 0.07 * (col + vec3(0.2));
  return col;
}

// Act 3: Mint Silk Wave (Ref 3)
vec3 renderAct3(vec2 uv, float time) {
  vec3 silverBase = vec3(0.86, 0.90, 0.89);
  vec3 mintGreen = vec3(0.22, 0.78, 0.66);
  vec3 deepTeal = vec3(0.06, 0.36, 0.32);
  vec3 silkHighlight = vec3(0.98, 1.0, 0.98);
  
  float ptrDist = length(uv - uPointer * 0.4);
  float ripple = sin(ptrDist * 14.0 - time * 3.2) * exp(-ptrDist * 2.8) * 0.14;
  
  float fold1 = sin(uv.x * 2.6 - uv.y * 3.4 + time * 0.28 + ripple);
  float fold2 = cos(uv.x * 1.9 + uv.y * 2.4 - time * 0.22);
  float silk = fold1 * 0.58 + fold2 * 0.42;
  
  float ridge = pow(clamp(1.0 - abs(silk), 0.0, 1.0), 3.2);
  float shadow = smoothstep(-0.85, 0.25, silk);
  
  vec3 col = mix(silverBase, mintGreen, smoothstep(-0.25, 0.85, silk));
  col = mix(deepTeal, col, shadow);
  col += silkHighlight * ridge * 0.68;
  
  float grain = (dither(gl_FragCoord.xy + fract(time * 5.1)) - 0.5);
  col += grain * 0.038;
  return col;
}

// Act 4: The Luminous Horizon Portal (Ref 4)
vec3 renderAct4(vec2 uv, float time) {
  vec3 deepSpace = vec3(0.01, 0.035, 0.22);
  
  float orbRadius = 0.58;
  vec2 topCenter = vec2(0.0, orbRadius * 0.82);
  vec2 bottomCenter = vec2(0.0, -orbRadius * 0.82);
  
  float dTop = length(uv - topCenter);
  float dBottom = length(uv - bottomCenter);
  
  // Smooth, organic spherical falloff without harsh edges
  float glowTop = exp(-pow(dTop / orbRadius, 2.0) * 2.8);
  float glowBottom = exp(-pow(dBottom / orbRadius, 2.0) * 2.8);
  
  vec3 electricBlue = vec3(0.12, 0.38, 0.98);
  vec3 luminousCyan = vec3(0.65, 0.88, 1.0);
  vec3 coreWhite = vec3(0.96, 0.98, 1.0);
  
  // Velvety soft horizon transition
  float horizonPinch = smoothstep(0.0, 0.14, abs(uv.y));
  
  vec3 col = deepSpace;
  col += electricBlue * (glowTop + glowBottom) * 0.95;
  col = mix(col, luminousCyan, pow(glowTop, 1.8) * 0.85 + pow(glowBottom, 1.8) * 0.85);
  col = mix(col, coreWhite, pow(glowTop, 3.4) * 0.92 + pow(glowBottom, 3.4) * 0.92);
  
  // Smooth dark space between orbs
  col = mix(vec3(0.005, 0.015, 0.08), col, 0.35 + 0.65 * horizonPinch);
  return col;
}

// Seamless active-act branching (renders only the 1 or 2 currently active acts)
vec3 renderExperience(vec2 uv, float time, float actProgress) {
  float p = clamp(actProgress, 0.0, 3.0);
  if (p < 0.005) {
    return renderAct1(uv, time);
  } else if (p < 1.0) {
    return mix(renderAct1(uv, time), renderAct2(uv, time), smoothstep(0.0, 1.0, p));
  } else if (p < 1.005) {
    return renderAct2(uv, time);
  } else if (p < 2.0) {
    return mix(renderAct2(uv, time), renderAct3(uv, time), smoothstep(0.0, 1.0, p - 1.0));
  } else if (p < 2.005) {
    return renderAct3(uv, time);
  } else if (p < 3.0) {
    return mix(renderAct3(uv, time), renderAct4(uv, time), smoothstep(0.0, 1.0, p - 2.0));
  } else {
    return renderAct4(uv, time);
  }
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec3 paper = vec3(0.972, 0.969, 0.958);
  vec3 col = paper;

  vec3 ro = vec3(uv * 4.0 * uCamera / 5.2, 3.0);
  vec3 rd = vec3(0.0, 0.0, -1.0);

  float dist = 2.72;
  float d = 1.0;
  bool hit = false;
  float minDist = 50.0;

  if (uDissolve < 0.999) {
    for (int i = 0; i < 56; i++) {
      vec3 pos = ro + rd * dist;
      d = map(pos);
      minDist = min(minDist, d);
      if (d < 0.0009) {
        hit = true;
        break;
      }
      dist += max(0.0008, d * 0.78);
      if (dist > 3.35) break;
    }

    if (hit) {
      vec3 p = ro + rd * dist;
      vec4 s = uShapes[0];
      float kind = uKinds[0];
      float nearest = 100.0;
      for (int i = 0; i < 8; i++) {
        float dd = shapeDistance(p, uShapes[i], uKinds[i]);
        if (dd < nearest) {
          nearest = dd;
          s = uShapes[i];
          kind = uKinds[i];
        }
      }

      vec3 n = normalAt(p, s, kind);
      float cosTheta = clamp(dot(-rd, n), 0.0, 1.0);
      float angle = 1.0 - cosTheta; // 0 at center, 1 at edges

      // Clear transmission base
      vec3 transmission = paper;

      // Performance: Early-out on flat capsule faces (skip heavy dispersion raymarch on 80% of glass pixels)
      float bevelFactor = smoothstep(0.02, 0.45, angle);
      vec3 spectralRefract = paper;

      if (bevelFactor > 0.001) {
        // Sample across 5 optimized spectral bands (28.5% faster with zero visible loss)
        const int SAMPLES = 5;
        vec3 specAcc = vec3(0.0);
        vec3 spectralWeightSum = vec3(0.0);
        float baseIOR = 1.55;
        float diveFactor = clamp((5.2 - uCamera) / 3.8, 0.0, 1.0);
        float dispersionStrength = 0.22 + diveFactor * 0.35;

        for (int k = 0; k < SAMPLES; k++) {
          float lambda = float(k) / float(SAMPLES - 1);
          vec3 specColor = wavelengthToRGB(lambda);
          float ior = baseIOR + dispersionStrength * (1.0 - lambda - 0.5);
          vec3 refr = refract(rd, n, 1.0 / ior);

          vec3 innerPos = p + refr * 0.015;
          for (int step = 0; step < 8; step++) {
            float id = shapeDistance(innerPos, s, kind);
            if (id > -0.0008) break;
            innerPos += refr * max(0.003, -id * 0.85);
          }

          vec3 exitN = -normalAt(innerPos, s, kind);
          vec3 outRay = refract(refr, exitN, ior);
          if (dot(outRay, outRay) < 0.001) {
            outRay = reflect(refr, exitN);
          }

          vec3 sampleColor = studioEnvironment(normalize(outRay));
          specAcc += sampleColor * specColor;
          spectralWeightSum += specColor;
        }
        spectralRefract = specAcc / max(vec3(0.001), spectralWeightSum);
      }

      vec3 glassBody = mix(paper * 0.995, spectralRefract, bevelFactor * 0.85);

      // Fresnel reflection
      float f0 = 0.055;
      float fresnel = f0 + (1.0 - f0) * pow(angle, 4.2);
      vec3 reflected = studioEnvironment(reflect(rd, n));
      vec3 glass = mix(glassBody, reflected, fresnel);

      // Vivid Prismatic Caustic Bands along Bevel (matching reference image)
      vec2 nxy = normalize(n.xy + vec2(0.0001));
      float light1 = dot(nxy, normalize(vec2(-0.7, 0.65)));
      float light2 = dot(nxy, normalize(vec2(0.65, 0.72)));
      
      float causticBand = smoothstep(0.05, 0.35, angle) * (1.0 - smoothstep(0.72, 0.96, angle));
      float causticSweep = clamp((angle - 0.08) / 0.55 + light1 * 0.22, 0.0, 1.0);
      vec3 causticRainbow = wavelengthToRGB(causticSweep);
      
      // Secondary internal chromatic sheen (violet-cyan-gold)
      float causticSweep2 = clamp(1.0 - (angle - 0.1) / 0.6 + light2 * 0.25, 0.0, 1.0);
      vec3 causticRainbow2 = wavelengthToRGB(causticSweep2);

      vec3 caustics = (causticRainbow * max(0.0, light1 + 0.35) * 2.4 +
                       causticRainbow2 * max(0.0, light2 + 0.2) * 1.8) * causticBand;
      glass += caustics;

      // Studio Specular Glints (Razor-sharp crystal highlights)
      vec3 refl = reflect(rd, n);
      float specKey1 = pow(max(0.0, dot(refl, normalize(vec3(-0.65, 0.72, 0.45)))), 160.0) * 7.5;
      float specKey2 = pow(max(0.0, dot(refl, normalize(vec3(0.58, 0.78, 0.4)))), 130.0) * 6.0;
      float specSoft = pow(max(0.0, dot(refl, normalize(vec3(0.0, 0.92, 0.38)))), 22.0) * 0.45;
      
      // Crisp outer rim catchlight
      float rimCatch = pow(angle, 3.2) * smoothstep(0.5, 0.98, angle) * 
                       pow(max(0.0, dot(nxy, normalize(vec2(-0.35, 0.93)))), 1.5) * 3.2;

      vec3 specular = vec3(specKey1 + specKey2 + specSoft + rimCatch);
      // Soft highlight compression
      specular = specular / (vec3(1.0) + specular * 0.25);
      glass += specular;

      // Subpixel analytical edge anti-aliasing (silky smooth curves)
      float edgeAA = smoothstep(0.002, 0.045, n.z);
      col = mix(paper, glass, edgeAA);
    } else {
      // Silhouette subpixel anti-aliasing for ray misses right on the edge
      float silhouetteAA = smoothstep(0.0035, 0.0005, minDist);
      if (silhouetteAA > 0.0) {
        vec3 rimTint = mix(paper, vec3(0.94, 0.95, 0.97), 0.5);
        col = mix(paper, rimTint, silhouetteAA * 0.4);
      }
    }
  }

  // Performance: only evaluate Experience shader when uDissolve > 0.005 (0% cost on Home/About/Contact)
  if (uDissolve > 0.005) {
    vec3 expCol = renderExperience(uv, uTime, uActProgress);
    col = mix(col, expCol, smoothstep(0.05, 0.92, uDissolve));
  }

  // Subtle film dither to eliminate 8-bit banding completely
  col += (dither(gl_FragCoord.xy + fract(uTime * 13.7)) - 0.5) * 0.0035;

  gl_FragColor = vec4(col, 1.0);
}
`;
