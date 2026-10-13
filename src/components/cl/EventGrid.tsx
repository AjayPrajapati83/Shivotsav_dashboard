'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Event, EventType } from '@/lib/types';
import { SCORING_RULES } from '@/lib/scoring';
import { RulesModal } from './RulesModal';

const TYPE_STYLES: Record<EventType, { bg: string; border: string; badge: string; glow: string }> = {
  Flagship: {
    bg: 'from-amber-100/80 via-yellow-50/60 to-transparent',
    border: 'border-amber-300 hover:border-amber-400',
    badge: 'bg-amber-200 text-amber-900 border border-amber-300',
    glow: 'shadow-md',
  },
  Large: {
    bg: 'from-orange-100/80 via-amber-50/60 to-transparent',
    border: 'border-orange-300 hover:border-orange-400',
    badge: 'bg-orange-200 text-orange-900 border border-orange-300',
    glow: 'shadow-md',
  },
  Small: {
    bg: 'from-yellow-100/80 via-amber-50/60 to-transparent',
    border: 'border-yellow-300 hover:border-yellow-400',
    badge: 'bg-yellow-200 text-yellow-900 border border-yellow-300',
    glow: 'shadow-md',
  },
};

const DEPT_COLORS: Record<string, string> = {
  'Performing Arts': 'text-pink-600',
  'Fine Arts': 'text-emerald-600',
  'Literary Arts': 'text-violet-600',
  'Informals': 'text-orange-600',
  'Gaming & Sports': 'text-cyan-600',
};

function getPodiumPoints(type: EventType) {
  const rules = SCORING_RULES.filter((r) => r.event_type === type);
  return {
    first: rules.find((r) => r.code === 'PODIUM_1')?.points ?? 0,
    second: rules.find((r) => r.code === 'PODIUM_2')?.points ?? 0,
    third: rules.find((r) => r.code === 'PODIUM_3')?.points ?? 0,
    participation: rules.find((r) => r.code === 'PARTICIPATION')?.points ?? 0,
  };
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const style = TYPE_STYLES[event.type];
  const podium = getPodiumPoints(event.type);
  const [isMobile, setIsMobile] = useState(true); // Default to mobile (no animation) for SSR

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cardContent = (
    <>
      {/* Type badge */}
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${style.badge}`}>
          {event.type}
        </span>
        {event.entry_fee && (
          <span className="text-xs text-amber-700 font-inter font-semibold">
            ₹{event.entry_fee}
          </span>
        )}
      </div>

      {/* Event name */}
      <h3 className="font-cinzel text-base sm:text-lg text-amber-900 font-bold mb-1 leading-tight">
        {event.name}
      </h3>

      {/* Department */}
      <span className={`text-xs ${DEPT_COLORS[event.department] || 'text-amber-700'} font-inter font-semibold`}>
        {event.department}
      </span>

      {/* Podium points */}
      <div className="mt-3 pt-3 border-t-2 border-amber-200 flex items-center gap-3 text-xs font-inter font-semibold">
        <span className="text-amber-800">🥇 {podium.first}</span>
        <span className="text-amber-700">🥈 {podium.second}</span>
        <span className="text-amber-600">🥉 {podium.third}</span>
        <span className="text-amber-500 ml-auto text-[10px]">+{podium.participation}</span>
      </div>
    </>
  );

  // Use regular div on mobile, motion.div on desktop
  if (isMobile) {
    return (
      <div className={`bg-gradient-to-br ${style.bg} backdrop-blur-sm border-2 ${style.border} rounded-xl p-4 sm:p-5 ${style.glow} group`}>
        {cardContent}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`bg-gradient-to-br ${style.bg} backdrop-blur-sm border-2 ${style.border} rounded-xl p-4 sm:p-5 ${style.glow} transition-all duration-300 hover:scale-[1.02] group`}
    >
      {cardContent}
    </motion.div>
  );
}

export function EventGrid({ events }: { events: Event[] }) {
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [showRules, setShowRules] = useState(false);

  const filtered = events.filter((e) => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    return true;
  });

  return (
    <section className="relative z-10 px-4 py-12 max-w-6xl mx-auto w-full">
      {/* Section header */}
      <div className="text-center mb-8">
        <h2 className="font-cinzel-decorative text-xl sm:text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 font-bold drop-shadow">
          Trials of the Gods
        </h2>
        <p className="text-amber-700 text-xs sm:text-sm font-inter mt-1 font-medium">
          {events.length} Events • 5 Departments
        </p>
      </div>

      {/* Event Type Filters - Centered */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          {(['Flagship', 'Large', 'Small'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t === typeFilter ? 'all' : t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[40px] ${
                typeFilter === t
                  ? 'bg-amber-500 text-white border-2 border-amber-600 shadow-lg'
                  : 'bg-white/80 text-amber-800 border-2 border-amber-200 hover:border-amber-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        
        {/* Scoring Rules Button */}
        <button
          onClick={() => setShowRules(true)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur border-2 border-amber-300 hover:border-amber-500 rounded-lg px-5 py-2 text-sm text-amber-800 hover:text-amber-900 font-semibold transition-all shadow-md hover:shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Scoring Rules
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((event, i) => (
          <EventCard key={event.id} event={event} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-amber-600 text-sm font-medium">
          No events match your filters
        </div>
      )}

      {/* Rules Modal */}
      <RulesModal open={showRules} onClose={() => setShowRules(false)} />
    </section>
  );
}
