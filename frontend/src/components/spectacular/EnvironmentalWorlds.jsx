'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wind, Droplets, Sun, Snowflake, Waves, Mountain, 
  TreePine, Zap, ArrowUpRight, Compass, X
} from 'lucide-react';

const FALLBACK_SPECIMEN_SVG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='100%25' height='100%25' fill='%23141815'/%3E%3Ccircle cx='400' cy='250' r='160' fill='none' stroke='%232a3028' stroke-width='1.5' stroke-dasharray='4 4'/%3E%3Ccircle cx='400' cy='250' r='100' fill='none' stroke='%23d49a50' stroke-width='1' opacity='0.3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%23a8a192' letter-spacing='2'%3E[ TERRESTRIAL SPECIMEN ARCHIVE ]%3C/text%3E%3C/svg%3E";

const WORLDS = [
  {
    id: 'arctic',
    number: '01',
    title: 'Arctic Polar Gyre',
    region: 'High Latitudes · 82° N',
    description: 'Pristine cryospheric boundary conditions, albedo feedback mechanisms, and circulating sea-ice corridors.',
    image: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1000&auto=format&fit=crop&q=80',
    icon: Snowflake,
    accent: '#8faf9a',
    stats: { temp: '-18.4°C', humidity: '42%', aqi: '11 · Clean' },
    threatLevel: 'Vulnerable',
    tags: ['Cryosphere', 'Albedo', 'Circumpolar']
  },
  {
    id: 'rainforest',
    number: '02',
    title: 'Equatorial Canopy',
    region: 'Amazon Basin · 03° S',
    description: 'Dense multi-strata carbon sink with intensive evapotranspiration regulating global tropospheric moisture flux.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&auto=format&fit=crop&q=80',
    icon: TreePine,
    accent: '#d49a50',
    stats: { temp: '+27.2°C', humidity: '88%', aqi: '24 · Good' },
    threatLevel: 'Moderate',
    tags: ['Biosphere', 'Carbon Sink', 'Biodiversity']
  },
  {
    id: 'oceanic',
    number: '03',
    title: 'Abyssal Thermohaline',
    region: 'North Atlantic Drift',
    description: 'Deep overturning meridional circulation transferring vast caloric volume across hemispheric marine basins.',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1000&auto=format&fit=crop&q=80',
    icon: Waves,
    accent: '#8faf9a',
    stats: { temp: '+14.1°C', humidity: '76%', aqi: '18 · Pristine' },
    threatLevel: 'Stable',
    tags: ['Hydrosphere', 'AMOC', 'Salinity']
  },
  {
    id: 'arid',
    number: '04',
    title: 'Thar & Sahelian Belt',
    region: 'Subtropical Ridge · 26° N',
    description: 'High diurnal thermal fluctuation, intense solar flux, and aerosolized particulate suspension dynamics.',
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1000&auto=format&fit=crop&q=80',
    icon: Sun,
    accent: '#d97251',
    stats: { temp: '+41.6°C', humidity: '14%', aqi: '184 · Poor' },
    threatLevel: 'Critical',
    tags: ['Deserts', 'Solar Flux', 'Particulate']
  },
  {
    id: 'urban',
    number: '05',
    title: 'Indo-Gangetic Basin',
    region: 'Delhi NCR · 28.61° N',
    description: 'Dense anthropocentric thermal mass, nocturnal boundary layer inversion trapping fine PM2.5 particulates.',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1000&auto=format&fit=crop&q=80',
    icon: Wind,
    accent: '#d97251',
    stats: { temp: '+29.0°C', humidity: '64%', aqi: '318 · Severe' },
    threatLevel: 'Emergency',
    tags: ['Anthropocene', 'Inversion', 'Micro-climate']
  },
  {
    id: 'montane',
    number: '06',
    title: 'Himalayan Ridge',
    region: 'Tibetan Plateau · 31° N',
    description: 'The world’s Third Pole, regulating Asian monsoon patterns and glacial headwaters for over 1.4 billion residents.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&auto=format&fit=crop&q=80',
    icon: Mountain,
    accent: '#d49a50',
    stats: { temp: '+04.8°C', humidity: '38%', aqi: '14 · Clean' },
    threatLevel: 'Vulnerable',
    tags: ['Orographic', 'Glaciology', 'Headwaters']
  },
  {
    id: 'wetlands',
    number: '07',
    title: 'Mangrove Estuaries',
    region: 'Sundarbans · 21.9° N',
    description: 'Dynamic intertidal saline buffer, protecting delta shorelines from cyclonic surges while sequestering blue carbon.',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1000&auto=format&fit=crop&q=80',
    icon: Droplets,
    accent: '#8faf9a',
    stats: { temp: '+26.5°C', humidity: '91%', aqi: '36 · Good' },
    threatLevel: 'Vulnerable',
    tags: ['Blue Carbon', 'Tidal', 'Buffer']
  },
  {
    id: 'renewables',
    number: '08',
    title: 'Geothermal Fields',
    region: 'Rift Fracture Zone',
    description: 'Subterranean thermodynamic enthalpy conversion generating baseload zero-emission dispatchable energy.',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1000&auto=format&fit=crop&q=80',
    icon: Zap,
    accent: '#d49a50',
    stats: { temp: '+21.0°C', humidity: '52%', aqi: '09 · Baseline' },
    threatLevel: 'Renewing',
    tags: ['Thermodynamics', 'Clean Tech', 'Baseload']
  }
];

export default function EnvironmentalWorlds() {
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = WORLDS.filter(w => {
    if (filter === 'all') return true;
    if (filter === 'critical') return w.threatLevel === 'Critical' || w.threatLevel === 'Emergency';
    if (filter === 'pristine') return w.threatLevel === 'Stable' || w.threatLevel === 'Renewing';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0e110f] text-[#f5f2ea] px-4 sm:px-6 lg:px-12 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="border-b border-[#2a3028] pb-6 sm:pb-8 mb-8 sm:mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-[#d49a50] mb-2 sm:mb-3">
                <Compass className="w-3.5 h-3.5" />
                <span>Plate 02 · Terrestrial & Atmospheric Ensembles</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#f5f2ea]">
                Planetary Spheres
              </h1>
              <p className="text-[#a8a192] text-xs sm:text-base max-w-2xl mt-2 sm:mt-3 font-sans leading-relaxed">
                Archival cross-sections of planetary microclimates. Each biome models equilibrium states, aerosol concentrations, and particulate transport vectors.
              </p>
            </div>

            {/* Quick Metrics Bar - adjusts cleanly on mobile */}
            <div className="flex items-center gap-4 bg-[#141815] border border-[#2a3028] px-4 py-3 self-start md:self-auto">
              <div>
                <span className="block font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#a8a192]">Sensing Stations</span>
                <span className="font-serif text-base sm:text-lg text-[#f5f2ea]">8 Global Biomes</span>
              </div>
              <div className="w-[1px] h-8 bg-[#2a3028]" />
              <div>
                <span className="block font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#a8a192]">Sampling Mode</span>
                <span className="font-serif text-base sm:text-lg text-[#d49a50]">Illustrative Model</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-6 sm:mt-8 pt-4 border-t border-[#2a3028]/60">
            <span className="font-mono text-xs uppercase tracking-widest text-[#a8a192] mr-2">
              Filter Ensembles:
            </span>
            {[
              { id: 'all', label: 'All Biomes (8)' },
              { id: 'critical', label: 'Critical / Inversion' },
              { id: 'pristine', label: 'Baseline & Stable' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`font-mono text-[11px] sm:text-xs uppercase tracking-wider px-3 py-1.5 transition-colors border ${
                  filter === tab.id
                    ? 'bg-[#d49a50] text-[#0e110f] border-[#d49a50] font-semibold'
                    : 'bg-[#141815] text-[#a8a192] border-[#2a3028] hover:text-[#f5f2ea] hover:border-[#3d453b]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Biomes Grid - Responsive for phones and laptops */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((world, idx) => {
            const IconComponent = world.icon;
            return (
              <motion.article
                key={world.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                onClick={() => setSelectedWorld(world)}
                className="group relative bg-[#141815] border border-[#2a3028] hover:border-[#d49a50]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Image Aspect container */}
                <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#0e110f]">
                  <img
                    src={world.image}
                    alt={world.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_SPECIMEN_SVG;
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141815] via-transparent to-black/30 pointer-events-none" />
                  
                  {/* Top tags */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="font-mono text-[10px] tracking-widest text-[#0e110f] bg-[#d49a50] px-2 py-0.5 uppercase font-semibold">
                      {world.number}
                    </span>
                    <span className="font-mono text-[10px] tracking-wider text-[#f5f2ea] bg-[#0e110f]/85 backdrop-blur-sm border border-[#2a3028] px-2 py-0.5">
                      {world.threatLevel}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 pointer-events-none">
                    <div className="w-6 h-6 rounded-none bg-[#0e110f]/90 border border-[#2a3028] flex items-center justify-center text-[#d49a50]">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-mono text-[10px] sm:text-[11px] text-[#f5f2ea] drop-shadow-md">
                      {world.region}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-normal text-[#f5f2ea] group-hover:text-[#d49a50] transition-colors mb-2">
                      {world.title}
                    </h3>
                    <p className="text-xs text-[#a8a192] leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4">
                      {world.description}
                    </p>
                  </div>

                  <div>
                    {/* Measurements Bar */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-[#0e110f] border border-[#2a3028] font-mono text-[10px] sm:text-[11px] mb-3 sm:mb-4">
                      <div>
                        <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-[#a8a192]">Temp</span>
                        <span className="text-[#f5f2ea] font-medium">{world.stats.temp}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-[#a8a192]">Moist.</span>
                        <span className="text-[#f5f2ea] font-medium">{world.stats.humidity}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-[#a8a192]">Index</span>
                        <span className="text-[#d49a50] font-medium">{world.stats.aqi.split(' ')[0]}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-[#a8a192] group-hover:text-[#f5f2ea]">
                      <span className="uppercase tracking-wider text-[10px]">Inspect Specimen</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#d49a50] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Modal Specimen Inspector - fully responsive with scroll & fallback */}
        <AnimatePresence>
          {selectedWorld && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWorld(null)}
              className="fixed inset-0 z-50 bg-[#0e110f]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#141815] border border-[#2a3028] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 relative shadow-2xl"
              >
                <div className="flex items-start justify-between border-b border-[#2a3028] pb-4 mb-5">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-widest text-[#d49a50] mb-1">
                      Specimen Dossier · {selectedWorld.number}
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#f5f2ea]">
                      {selectedWorld.title}
                    </h2>
                    <p className="font-mono text-xs text-[#a8a192]">{selectedWorld.region}</p>
                  </div>
                  <button
                    onClick={() => setSelectedWorld(null)}
                    className="font-mono text-xs text-[#a8a192] hover:text-[#f5f2ea] border border-[#2a3028] px-2.5 py-1.5 flex items-center gap-1.5 transition-colors"
                  >
                    <span>CLOSE</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-44 sm:h-64 w-full overflow-hidden mb-5 border border-[#2a3028] relative bg-[#0e110f]">
                  <img
                    src={selectedWorld.image}
                    alt={selectedWorld.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_SPECIMEN_SVG;
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="text-xs sm:text-sm text-[#f5f2ea]/90 leading-relaxed font-sans mb-5">
                  {selectedWorld.description}
                </p>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-[#0e110f] border border-[#2a3028] p-3 sm:p-4 font-mono mb-5">
                  <div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#a8a192]">Equilibrium Temp</div>
                    <div className="text-base sm:text-lg text-[#f5f2ea] mt-0.5">{selectedWorld.stats.temp}</div>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#a8a192]">Atmospheric Vapor</div>
                    <div className="text-base sm:text-lg text-[#f5f2ea] mt-0.5">{selectedWorld.stats.humidity}</div>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#a8a192]">Aerosol Index</div>
                    <div className="text-base sm:text-lg text-[#d49a50] mt-0.5">{selectedWorld.stats.aqi}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-[#2a3028]">
                  {selectedWorld.tags.map(tag => (
                    <span key={tag} className="font-mono text-[10px] uppercase tracking-wider text-[#a8a192] bg-[#0e110f] border border-[#2a3028] px-2.5 py-1">
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
