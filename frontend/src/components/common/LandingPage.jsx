'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import initPlanet3D from '@/components/3D/planet';
import Footer from './Footer';

const FIELD_DISPATCHES = [
  {
    volume: 'ENTRY // 01',
    category: 'Ingestion & Ground Truth',
    title: 'Continuous Ground Station Ingestion',
    summary:
      'Raw, unvarnished PM2.5 and PM10 micro-measurements normalized from Central Pollution Control Board (CPCB) and OpenAQ sensor nodes across Anand Vihar, Punjabi Bagh, and Mandir Marg.',
    tag: 'Empirical Telemetry',
  },
  {
    volume: 'ENTRY // 02',
    category: 'Methodology & Breakpoints',
    title: 'The National AQI Formula',
    summary:
      'Applying linear interpolation across official CPCB sub-index concentration intervals to calculate provisional, real-time index values rather than uncalibrated algorithmic estimations.',
    tag: 'CPCB Compliant',
  },
  {
    volume: 'ENTRY // 03',
    category: 'Regulatory Enforcement',
    title: 'CAQM Graded Response (GRAP)',
    summary:
      'Discerning mathematically inferred pollution bands from officially notified Stage I–IV executive orders issued by the Commission for Air Quality Management.',
    tag: 'Statutory Protocol',
  },
  {
    volume: 'ENTRY // 04',
    category: 'Diurnal Atmospheric Science',
    title: 'The Midday Dispersion Window',
    summary:
      'Tracking boundary layer inversion height and thermal mixing velocity to pinpoint the brief early-afternoon window when outdoor exposure is least hazardous.',
    tag: 'Exposure Mitigation',
  },
];

const MONOGRAPHS = [
  {
    index: 'I',
    title: 'The Winter Smog Ledger',
    subtitle: 'Delhi NCR Field Dashboard',
    desc: 'Live telemetry, hourly station breakdown, CPCB category classifications, and immediate citizen guidance.',
    href: '/dashboard',
    cta: 'Examine Live Ledger',
  },
  {
    index: 'II',
    title: 'Planetary Atmospheric Spheres',
    subtitle: 'Interactive 3D WebGL Visualization',
    desc: 'Interactive orbital visualization tracing seasonal thermal anomalies and transboundary aerosol flows.',
    href: '/worlds',
    cta: 'Rotate the Sphere',
  },
  {
    index: 'III',
    title: 'The Citizen Field Notebook',
    subtitle: 'Community Science & Verified Action',
    desc: 'A community log for ground-level sensor validation, neighborhood reports, and verified conservation milestones.',
    href: '/achievements',
    cta: 'Open Field Notes',
  },
];

export default function LandingPage() {
  const heroCanvasRef = useRef(null);

  useEffect(() => {
    let planetInstance;
    try {
      if (heroCanvasRef.current) {
        planetInstance = initPlanet3D('canvas.planet-3D-hero');
      }
    } catch (err) {
      console.warn('3D Planet WebGL fallback mode active:', err);
    }

    return () => {
      if (planetInstance) {
        try {
          if (typeof planetInstance.destroy === 'function') {
            planetInstance.destroy();
          } else if (planetInstance.renderer) {
            const gl = planetInstance.renderer.getContext();
            gl?.getExtension('WEBGL_lose_context')?.loseContext();
            planetInstance.renderer.dispose();
          }
        } catch {
          // ignore cleanup
        }
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0e110f] text-[#f5f2ea] relative selection:bg-[#d49a50] selection:text-[#0e110f] overflow-hidden pt-24">
      {/* ----------------- EDITORIAL HERO SECTION ----------------- */}
      <section className="section-spacing relative z-10 w-full border-b border-white/[0.08]">
        <div className="container-editorial grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Editorial Narrative (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Archival metadata line */}
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-ochre mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-ochre" />
              <span>Observatory Dispatch No. 418</span>
              <span className="text-white/20">&middot;</span>
              <span className="text-parchment-muted">Winter 2026</span>
            </div>

            {/* Headline in High-Contrast Editorial Serif */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-parchment leading-[1.12]">
              An Atmospheric <br className="hidden sm:inline" />
              <em className="font-serif italic font-normal text-ochre-light">Field Observatory</em> <br />
              for the Capital Region.
            </h1>

            {/* Editorial Body */}
            <p className="mt-6 text-base sm:text-lg text-parchment-muted font-sans font-light leading-editorial max-w-xl">
              EcoSphere is an independent digital monograph and environmental monitoring radar. It transforms complex CPCB sensor telemetry, ground-level particulate matter, and CAQM emergency directives into legible, human-scale intelligence.
            </p>

            {/* Action Group */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-full bg-ochre text-ink text-xs font-mono uppercase tracking-[0.16em] font-semibold hover:bg-ochre-light transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Read Today&apos;s Field Ledger</span>
                <span suppressHydrationWarning className="inline-flex">
                  <ArrowUpRight size={15} suppressHydrationWarning />
                </span>
              </Link>
              <Link
                href="/worlds"
                className="px-6 py-3.5 rounded-full border border-white/20 text-parchment text-xs font-mono uppercase tracking-[0.16em] hover:border-parchment transition-all text-center justify-center flex items-center"
              >
                Planetary 3D Sphere
              </Link>
            </div>

            {/* Field Notes Quote Bar */}
            <div className="mt-10 pt-6 border-t border-white/[0.08] w-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-left">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-parchment-muted">
                  Current Conditions
                </p>
                <p className="mt-1 text-sm font-serif font-semibold text-terracotta">
                  See field dashboard
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-parchment-muted">
                  Primary Vector
                </p>
                <p className="mt-1 text-sm font-serif font-semibold text-parchment">
                  PM2.5 / PM10
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-parchment-muted">
                  Monitoring Area
                </p>
                <p className="mt-1 text-sm font-serif font-semibold text-sage">
                  Delhi NCR
                </p>
              </div>
            </div>
          </div>

          {/* Right: Tactile 3D Sphere (5 Columns) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-square rounded-2xl border border-white/[0.08] bg-[#141815] p-3 flex flex-col justify-between overflow-hidden shadow-xl">
              {/* Top Bar inside frame */}
              <div className="flex items-center justify-between text-[11px] font-mono text-parchment-muted pb-2 border-b border-white/[0.06] z-20">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                  <span>PLANETARY VIEW</span>
                </span>
                <span>LAT 28&deg; 36&prime; N</span>
              </div>

              {/* 3D Canvas */}
              <div className="relative flex-1 w-full overflow-hidden my-2 rounded-xl bg-[#0e110f]">
                <canvas
                  ref={heroCanvasRef}
                  className="planet-3D-hero w-full h-full object-cover cursor-grab active:cursor-grabbing"
                />
              </div>

              {/* Bottom annotation */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-parchment-muted z-20">
                <span>CPCB / METEO-OPENAQ v3</span>
                <span className="text-ochre">3D VISUALIZATION</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ----------------- METHODOLOGY / ENTRIES (THE NOTEBOOK) ----------------- */}
      <section className="section-spacing container-editorial">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-ochre mb-2">
            Methodology &amp; Core Tenets
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-parchment tracking-tight">
            How EcoSphere Observes the Sky.
          </h2>
          <p className="mt-3 text-sm text-parchment-muted font-sans font-light leading-editorial">
            Rather than relying on proprietary opaque forecasting models, EcoSphere adheres to empirical public records, statutory standards, and atmospheric physics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FIELD_DISPATCHES.map((d) => (
            <div
              key={d.title}
              className="editorial-card p-7 flex flex-col justify-between group hover:border-ochre/40 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-parchment-muted mb-4">
                  <span className="text-ochre font-semibold">{d.volume}</span>
                  <span>{d.category}</span>
                </div>

                <h3 className="text-lg font-serif font-medium text-parchment mb-3 leading-snug group-hover:text-ochre-light transition-colors">
                  {d.title}
                </h3>

                <p className="text-xs text-parchment-muted font-sans font-light leading-relaxed">
                  {d.summary}
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-white/[0.06]">
                <span className="text-[11px] font-mono text-sage">
                  &sect; {d.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- THREE FIELD MONOGRAPHS (PORTFOLIO/WORLDS) ----------------- */}
      <section className="section-spacing border-t border-white/[0.08] bg-[#121613]">
        <div className="container-editorial">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-ochre mb-2">
                Observatory Exhibits
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-parchment tracking-tight">
                Three Distinct Instruments.
              </h2>
            </div>
            <p className="text-xs font-mono text-parchment-muted max-w-sm">
              Navigating between localized neighborhood stations, planetary climate heatmaps, and grassroots citizen reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {MONOGRAPHS.map((m) => (
              <div
                key={m.title}
                className="bg-[#151916] border border-white/[0.08] p-8 rounded-2xl flex flex-col justify-between hover:border-ochre/50 transition-all group"
              >
                <div>
                  <span className="inline-block w-7 h-7 rounded-full border border-white/20 text-center font-serif text-xs leading-7 text-ochre mb-6">
                    {m.index}
                  </span>

                  <p className="text-[11px] font-mono uppercase tracking-wider text-parchment-muted mb-2">
                    {m.subtitle}
                  </p>

                  <h3 className="text-2xl font-serif text-parchment mb-4 leading-tight group-hover:text-ochre-light transition-colors">
                    {m.title}
                  </h3>

                  <p className="text-xs text-parchment-muted font-sans font-light leading-editorial mb-8">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/[0.06]">
                  <Link
                    href={m.href}
                    className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-ochre hover:text-ochre-light transition-colors"
                  >
                    <span>{m.cta}</span>
                    <span suppressHydrationWarning className="inline-flex">
                      <ArrowUpRight size={14} suppressHydrationWarning />
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- CITIZEN CONTRIBUTION FOOTER CALLOUT ----------------- */}
      <section className="section-spacing container-editorial">
        <div className="bg-[#141815] border border-white/[0.08] p-8 sm:p-12 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8">
            <span className="text-xs font-mono uppercase tracking-[0.18em] text-sage">
              Citizen Science Initiative
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-parchment mt-2 mb-3">
              Contribute Ground Observations.
            </h3>
            <p className="text-xs sm:text-sm text-parchment-muted font-sans font-light leading-editorial max-w-xl">
              Air quality sensors can suffer local calibration drift or power anomalies. EcoSphere relies on neighborhood observers to cross-reference sensor reports, flag localized smoke burns, and build a collective archive.
            </p>
          </div>
          <div className="md:col-span-4 flex md:justify-end">
            <Link
              href="/achievements"
              className="px-6 py-3 rounded-full border border-ochre text-ochre hover:bg-ochre hover:text-ink text-xs font-mono uppercase tracking-[0.16em] transition-all"
            >
              Log an Observation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
