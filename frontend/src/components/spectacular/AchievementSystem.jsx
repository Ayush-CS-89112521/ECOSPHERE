'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, BookOpen, X
} from 'lucide-react';
import { useClerkStatus } from '../auth/ClerkSafeProvider';
import { useAccountDatabase } from '@/lib/use-account-database';

const FALLBACK_ACHIEVEMENT_SVG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='100%25' height='100%25' fill='%23141815'/%3E%3Ccircle cx='400' cy='250' r='140' fill='none' stroke='%232a3028' stroke-width='1.5' stroke-dasharray='4 4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='12' fill='%23d49a50' letter-spacing='2'%3E[ FIELD LEDGER RECORD ]%3C/text%3E%3C/svg%3E";

const ACHIEVEMENTS = [
  {
    id: 1,
    number: '01',
    title: 'Baseline Observer',
    description: 'Check Delhi air quality on 7 different days while signed in. Days are counted in IST.',
    rarity: 'Field Standard',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    category: 'Observation'
  },
  {
    id: 2,
    number: '02',
    title: 'Inversion Sentinel',
    description: 'Logged winter atmospheric inversion episodes during nocturnal cooling cycles in Delhi NCR.',
    rarity: 'Specialized',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
    category: 'Atmospheric'
  },
  {
    id: 3,
    number: '03',
    title: 'GRAP Protocol Marshal',
    description: 'Executed 50 CAQM Stage III mitigation assessments and localized dust containment audits.',
    rarity: 'Distinguished',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop&q=80',
    category: 'Governance'
  },
  {
    id: 4,
    number: '04',
    title: 'Particulate Cartographer',
    description: 'Mapped micro-spatial PM2.5 dispersion profiles for Anand Vihar and Punjabi Bagh transit corridors.',
    rarity: 'Specialized',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    category: 'Cartography'
  },
  {
    id: 5,
    number: '05',
    title: 'Clean Energy Proponent',
    description: 'Audited rooftop photovoltaic yield versus particulate accumulation loss over 90 days.',
    rarity: 'Distinguished',
    image: 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=800&auto=format&fit=crop&q=80',
    category: 'Clean Tech'
  },
  {
    id: 6,
    number: '06',
    title: 'Aerosol Synthesis Pioneer',
    description: 'Authored multi-station comparative report linking stubble burning trajectory models to PM10 spikes.',
    rarity: 'Archival Elite',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    category: 'Research'
  }
];

export default function AchievementSystem() {
  const { isConfigured } = useClerkStatus();
  return isConfigured
    ? <AccountAchievements />
    : <AchievementGallery notice="Sign-in is currently unavailable." />;
}

function AccountAchievements() {
  const { client, isLoaded, userId } = useAccountDatabase();
  if (!isLoaded) return <AchievementGallery notice="Checking sign-in…" />;
  if (!userId) return <AchievementGallery notice="Sign in to track your badge progress." />;
  if (!client) return <AchievementGallery notice="Badge progress is currently unavailable." />;
  return <SavedAchievements key={userId} client={client} />;
}

function SavedAchievements({ client }) {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const { data, error } = await client.from('ecosphere_achievement_progress')
          .select('days_checked,earned_at').eq('badge_id', 'baseline-observer')
          .abortSignal(controller.signal).maybeSingle();
        if (!controller.signal.aborted) setResult(error ? { failed: true } : { progress: data });
      } catch {
        if (!controller.signal.aborted) setResult({ failed: true });
      }
    }
    load();
    return () => controller.abort();
  }, [client, attempt]);

  return <AchievementGallery
    baseline={result?.progress}
    notice={!result ? 'Loading badge progress…' : result.failed ? 'Could not load badge progress.' : null}
    retry={result?.failed ? () => {
      setResult(null);
      setAttempt(previous => previous + 1);
    } : undefined}
  />;
}

function AchievementGallery({ baseline, notice, retry }) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelected] = useState(null);
  const daysChecked = baseline?.days_checked ?? 0;
  const achievements = ACHIEVEMENTS.map(item => ({
    ...item,
    available: item.id === 1,
    earned: item.id === 1 && Boolean(baseline?.earned_at),
  }));
  const selected = achievements.find(item => item.id === selectedId);

  const earnedCount = achievements.filter(item => item.earned).length;

  const filtered = achievements.filter(a => {
    if (filter === 'earned') return a.earned;
    if (filter === 'in-progress') return a.available && !a.earned;
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
                <BookOpen className="w-3.5 h-3.5" />
                <span>Plate 03 · Field Notebook & Observational Milestones</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#f5f2ea]">
                Field Notes & Impact
              </h1>
              <p className="text-[#a8a192] text-xs sm:text-base max-w-2xl mt-2 sm:mt-3 font-sans leading-relaxed">
                Earn badges through your EcoSphere activity. More badges are coming soon.
              </p>
            </div>

            <div className="bg-[#141815] border border-[#2a3028] px-4 py-3 text-left self-start md:self-auto">
              <span className="block font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-[#a8a192]">Field Standing</span>
              <span className="font-serif text-base sm:text-lg text-[#f5f2ea]">{notice ? '—' : `${earnedCount} of 1 earned`}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mt-6 sm:mt-8 pt-4 border-t border-[#2a3028]/60">
            <span className="font-mono text-xs uppercase tracking-widest text-[#a8a192] mr-2">
              Filter Records:
            </span>
            {[
              { id: 'all', label: `All (${ACHIEVEMENTS.length})` },
              { id: 'earned', label: `Validated (${earnedCount})` },
              { id: 'in-progress', label: 'In Field' }
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

        {notice && <p role="status" className="mb-4 text-sm text-[#a8a192]">{notice}</p>}
        {retry && <button onClick={retry} className="mb-4 text-sm underline">Retry</button>}
        {!notice && filtered.length === 0 && <p className="text-sm text-[#a8a192]">No badges in this view yet.</p>}
        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((item, idx) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              onClick={() => setSelected(item.id)}
              className="group bg-[#141815] border border-[#2a3028] hover:border-[#d49a50]/60 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="font-mono text-xs text-[#d49a50] tracking-widest font-semibold">
                    ENTRY #{item.number}
                  </span>
                  <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                    item.earned 
                      ? 'bg-[#8faf9a]/15 text-[#8faf9a] border-[#8faf9a]/30' 
                      : 'bg-[#0e110f] text-[#a8a192] border-[#2a3028]'
                  }`}>
                    {item.earned ? 'Certified' : item.available ? 'Locked' : 'Coming Soon'}
                  </span>
                </div>

                <div className="h-36 sm:h-40 w-full overflow-hidden mb-4 border border-[#2a3028] relative bg-[#0e110f]">
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_ACHIEVEMENT_SVG;
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale-[25%] group-hover:grayscale-0"
                    loading="lazy"
                  />
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-normal text-[#f5f2ea] group-hover:text-[#d49a50] transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#a8a192] leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4">
                  {item.description}
                </p>
              </div>

              <div>
                {/* Progress Indicator */}
                {item.available && !notice && <div className="mb-3 sm:mb-4">
                  <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-[#a8a192] mb-1">
                    <span>AQI checks</span>
                    <span>{daysChecked} of 7 days</span>
                  </div>
                  <div className="w-full h-1 bg-[#0e110f] border border-[#2a3028] overflow-hidden">
                    <div 
                      className={`h-full ${item.earned ? 'bg-[#8faf9a]' : 'bg-[#d49a50]'}`}
                      style={{ width: `${daysChecked / 7 * 100}%` }}
                    />
                  </div>
                </div>}

                <div className="flex items-center justify-between font-mono text-xs text-[#a8a192] group-hover:text-[#f5f2ea] pt-3 border-t border-[#2a3028]">
                  <span className="text-[10px] uppercase tracking-wider">{item.rarity}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#d49a50] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Modal Inspector - responsive with scroll */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-50 bg-[#0e110f]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#141815] border border-[#2a3028] max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 relative shadow-2xl"
              >
                <div className="flex items-start justify-between border-b border-[#2a3028] pb-4 mb-5">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-widest text-[#d49a50] mb-1">
                      Field Dossier #{selected.number}
                    </div>
                    <h2 className="font-serif text-2xl text-[#f5f2ea]">
                      {selected.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="font-mono text-xs text-[#a8a192] hover:text-[#f5f2ea] border border-[#2a3028] px-2.5 py-1.5 flex items-center gap-1.5 transition-colors"
                  >
                    <span>CLOSE</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-40 sm:h-48 w-full overflow-hidden mb-5 border border-[#2a3028] bg-[#0e110f]">
                  <img
                    src={selected.image}
                    alt={selected.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_ACHIEVEMENT_SVG;
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="text-xs sm:text-sm text-[#f5f2ea]/90 font-sans leading-relaxed mb-5">
                  {selected.description}
                </p>

                <div className="bg-[#0e110f] border border-[#2a3028] p-3 sm:p-4 font-mono mb-4 text-xs">
                  <span className="block text-[10px] text-[#a8a192] uppercase">Award Category</span>
                  <span className="text-[#f5f2ea] mt-0.5">{selected.category}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
