'use client';

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0c0f0d] text-parchment-muted py-14">
      <div className="container-editorial">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/[0.06]">
          {/* Brand & Manifesto */}
          <div className="md:col-span-6 flex flex-col gap-2">
            <Link href="/" className="text-xl font-serif font-semibold text-parchment">
              EcoSphere
            </Link>
            <p className="text-xs text-parchment-muted font-sans font-light max-w-sm leading-relaxed">
              An open atmospheric observatory recording Delhi NCR ground station telemetry, statutory CAQM actions, and diurnal exposure mitigation.
            </p>
            <p className="mt-2 text-[11px] font-mono text-stone-500">
              Data synchronized from Central Pollution Control Board (CPCB) and OpenAQ sensor networks.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 flex flex-col gap-2 text-xs font-mono uppercase tracking-[0.15em]">
            <span className="text-parchment font-semibold mb-1">Navigation</span>
            <Link href="/dashboard" className="hover:text-ochre transition-colors">
              Field Dashboard
            </Link>
            <Link href="/worlds" className="hover:text-ochre transition-colors">
              Planetary Spheres
            </Link>
            <Link href="/achievements" className="hover:text-ochre transition-colors">
              Field Notebook
            </Link>
          </div>

          {/* Standards & Method */}
          <div className="md:col-span-3 flex flex-col gap-2 text-xs font-mono uppercase tracking-[0.15em]">
            <span className="text-parchment font-semibold mb-1">Protocols</span>
            <span className="text-stone-400">NAQI Micro-Breakpoints</span>
            <span className="text-stone-400">CAQM GRAP Guidelines</span>
            <span className="text-stone-400">Diurnal Boundary Physics</span>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-stone-500">
          <p>&copy; 2026 EcoSphere &middot; Dedicated to public environmental literacy.</p>
          <p className="text-stone-500">
            Typeset in <span className="text-stone-400">Playfair Display</span> &amp; <span className="text-stone-400">JetBrains Mono</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
