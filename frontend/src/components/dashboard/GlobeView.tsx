"use client"; // Next.js App Router: remove if you're on plain React / Vite

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const DELHI = { lat: 28.6139, lon: 77.209 };

const GLOBE_RADIUS = 1;
const GLOW_SCALE = 3; // sprite size in world units (globe diameter = 2)

const ORBIT_VIEW = { polar: 1.25, dist: 3.6 }; // idle view
const FOCUS_DIST = 2.35; // subtle zoom when focused
const AUTO_ROTATE_SPEED = 0.18; // rad / sec
const CAMERA_EASE = 2.2; // higher = snappier lerp

const DOT_STEP_DEG = 2.6; // dot spacing; ~5.8k dots total (a single draw call)

const DEG = Math.PI / 180;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** lat/lon (degrees) -> point on a sphere. Same convention as the land mask. */
function latLonToVector3(lat: number, lon: number, r = GLOBE_RADIUS) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/** Shortest signed angular difference, in [-PI, PI]. */
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

type LandMask = { data: Uint8ClampedArray; w: number; h: number };

/** Optional: load a tiny equirectangular black/white land mask (e.g. 360x180 PNG). */
function loadLandMask(src: string): Promise<LandMask | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = 360;
      const h = 180;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, w, h);
      resolve({ data: ctx.getImageData(0, 0, w, h).data, w, h });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function isLand(mask: LandMask, lat: number, lon: number) {
  const x = Math.min(mask.w - 1, Math.floor(((lon + 180) / 360) * mask.w));
  const y = Math.min(mask.h - 1, Math.floor(((90 - lat) / 180) * mask.h));
  return mask.data[(y * mask.w + x) * 4] > 128; // red channel > 50%
}

/** Procedural lat/lon dot grid; rows get fewer dots toward the poles. */
function buildDotPositions(mask: LandMask | null): Float32Array {
  const pts: number[] = [];
  for (let lat = -85; lat <= 85; lat += DOT_STEP_DEG) {
    const n = Math.max(1, Math.round((360 * Math.cos(lat * DEG)) / DOT_STEP_DEG));
    for (let i = 0; i < n; i++) {
      const lon = -180 + (i + 0.5) * (360 / n);
      if (mask && !isLand(mask, lat, lon)) continue;
      const v = latLonToVector3(lat, lon, GLOBE_RADIUS * 1.003);
      pts.push(v.x, v.y, v.z);
    }
  }
  return new Float32Array(pts);
}

/** Soft halo painted once on a small canvas (no shaders needed). */
function makeGlowTexture() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const half = size / 2;
  const edge = 2 / GLOW_SCALE; // where the globe's silhouette sits in the gradient
  const grad = g.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, "rgba(212,154,80,0)");
  grad.addColorStop(edge * 0.92, "rgba(212,154,80,0)");
  grad.addColorStop(edge, "rgba(212,154,80,0.35)");
  grad.addColorStop(edge + (1 - edge) * 0.35, "rgba(143,175,154,0.15)");
  grad.addColorStop(1, "rgba(14,17,15,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Props = {
  className?: string;
  /** ms after load before the camera glides to Delhi. `null` disables auto-focus. */
  autoFocusDelayMs?: number | null;
  /** Optional equirectangular land mask (white = land). Keep it under 500KB. */
  landMaskSrc?: string;
};

export default function GlobeView({
  className = "",
  autoFocusDelayMs = 2800,
  landMaskSrc,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ focus: () => void; release: () => void } | null>(null);
  const [focused, setFocused] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  const toggleFocus = useCallback(() => {
    if (!apiRef.current) return;
    if (focused) apiRef.current.release();
    else apiRef.current.focus();
  }, [focused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- renderer ---------- */
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setUnsupported(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.className = "absolute inset-0 block h-full w-full cursor-pointer";
    container.appendChild(canvas);

    /* ---------- scene / camera / light ---------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
    scene.add(camera);

    // Lights ride with the camera so the visible hemisphere is always lit.
    camera.add(new THREE.AmbientLight(0x6f8fa8, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(-2, 2, 3);
    camera.add(sun);

    /* ---------- globe (1 draw call) ---------- */
    const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 48, 32);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x0f1310,
      emissive: 0x070908,
      roughness: 0.9,
      metalness: 0,
    });
    scene.add(new THREE.Mesh(globeGeo, globeMat));

    /* ---------- dot grid (1 draw call) ---------- */
    const dotMat = new THREE.PointsMaterial({
      color: 0xd4cbb8,
      size: 0.014,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    let dotGeo: THREE.BufferGeometry | null = null;
    let dots: THREE.Points | null = null;
    const addDots = (mask: LandMask | null) => {
      dotGeo = new THREE.BufferGeometry();
      dotGeo.setAttribute("position", new THREE.BufferAttribute(buildDotPositions(mask), 3));
      dots = new THREE.Points(dotGeo, dotMat);
      scene.add(dots);
    };

    let disposed = false;
    if (landMaskSrc) {
      loadLandMask(landMaskSrc).then((mask) => {
        if (!disposed) addDots(mask); // falls back to a full grid if the mask fails
      });
    } else {
      addDots(null);
    }

    /* ---------- atmosphere glow (1 draw call, canvas texture) ---------- */
    const glowTex = makeGlowTexture();
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Sprite(glowMat);
    glow.scale.set(GLOW_SCALE, GLOW_SCALE, 1);
    scene.add(glow);

    /* ---------- Delhi marker: dot + pulsing ring (2 draw calls) ---------- */
    const delhiDir = latLonToVector3(DELHI.lat, DELHI.lon, 1).normalize();
    const markerPos = delhiDir.clone().multiplyScalar(GLOBE_RADIUS * 1.006);
    const toSurface = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      delhiDir
    );

    const markerGeo = new THREE.SphereGeometry(0.016, 12, 8);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xd97251 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(markerPos);
    scene.add(marker);

    const ringGeo = new THREE.RingGeometry(0.03, 0.038, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd49a50,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(markerPos);
    ring.quaternion.copy(toSurface);
    scene.add(ring);

    /* ---------- camera choreography ---------- */
    // Camera lives on spherical coords around the origin; lerp those values.
    const cam = { az: 0.6, polar: ORBIT_VIEW.polar, dist: ORBIT_VIEW.dist };
    const target = {
      az: Math.atan2(delhiDir.x, delhiDir.z),
      polar: Math.acos(delhiDir.y),
      dist: FOCUS_DIST,
    };
    let focusing = false;
    let fit = 1; // pushes the camera back on narrow (portrait) containers

    const applyCamera = () => {
      const d = cam.dist * fit;
      const sp = Math.sin(cam.polar);
      camera.position.set(d * sp * Math.sin(cam.az), d * Math.cos(cam.polar), d * sp * Math.cos(cam.az));
      camera.lookAt(0, 0, 0);
    };

    apiRef.current = {
      focus: () => {
        focusing = true;
        setFocused(true);
      },
      release: () => {
        focusing = false;
        setFocused(false);
      },
    };
    const onCanvasClick = () => apiRef.current?.focus();
    canvas.addEventListener("click", onCanvasClick);

    const autoFocusTimer =
      autoFocusDelayMs == null
        ? null
        : window.setTimeout(() => apiRef.current?.focus(), autoFocusDelayMs);

    /* ---------- render loop (paused when offscreen) ---------- */
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // frame-rate independent easing
      const k = reduceMotion ? 1 : 1 - Math.exp(-dt * CAMERA_EASE);

      if (focusing) {
        cam.az += wrapAngle(target.az - cam.az) * k;
        cam.polar += (target.polar - cam.polar) * k;
        cam.dist += (target.dist - cam.dist) * k;
      } else {
        if (!reduceMotion) cam.az += dt * AUTO_ROTATE_SPEED;
        cam.polar += (ORBIT_VIEW.polar - cam.polar) * k;
        cam.dist += (ORBIT_VIEW.dist - cam.dist) * k;
      }
      applyCamera();

      // pulse: ring grows and fades, then restarts
      const phase = reduceMotion ? 0.3 : (now / 1800) % 1;
      ring.scale.setScalar(1 + phase * 3.4);
      ringMat.opacity = 0.9 * (1 - phase) * (1 - phase);

      renderer.render(scene, camera);
    };

    const start = () => {
      if (raf || disposed) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    /* ---------- responsive sizing ---------- */
    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false); // CSS controls the canvas box
      const aspect = w / h;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      fit = Math.max(1, 0.88 / aspect);
      applyCamera();
      if (!raf) renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.01 }
    );
    io.observe(container);
    start();

    /* ---------- cleanup ---------- */
    return () => {
      disposed = true;
      stop();
      if (autoFocusTimer) clearTimeout(autoFocusTimer);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("click", onCanvasClick);
      apiRef.current = null;

      if (dots) scene.remove(dots);
      dotGeo?.dispose();
      dotMat.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      glowTex.dispose();
      glowMat.dispose();
      markerGeo.dispose();
      markerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();

      renderer.dispose();
      renderer.forceContextLoss();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, [autoFocusDelayMs, landMaskSrc]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Interactive 3D globe centred on Delhi NCR"
      className={`relative h-[min(80vh,640px)] min-h-[320px] w-full overflow-hidden rounded-xl bg-[#0e110f] ${className}`}
    >
      {/* Archival Coordinates HUD Overlay */}
      <div className="absolute top-3 left-3 z-10 font-mono text-[10px] text-parchment-muted flex items-center gap-2 bg-[#141815]/90 px-3 py-1 rounded-full border border-white/[0.08] backdrop-blur-sm pointer-events-none uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-sage" />
        <span>28.6139&deg; N, 77.2090&deg; E &middot; Delhi NCR</span>
      </div>

      {unsupported && (
        <p className="absolute inset-0 grid place-items-center px-6 text-center text-xs text-parchment-muted font-mono">
          WebGL is unavailable on this device.
        </p>
      )}

      {!unsupported && (
        <button
          type="button"
          onClick={toggleFocus}
          aria-pressed={focused}
          className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/20 bg-[#141815]/90 px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-parchment backdrop-blur-md transition-all hover:border-ochre hover:text-ochre"
        >
          {focused ? "Release Rotation" : "Focus on Delhi NCR"}
        </button>
      )}
    </div>
  );
}
