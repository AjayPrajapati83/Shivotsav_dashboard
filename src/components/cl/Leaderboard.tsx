'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/types';

function getRankStyle(rank: number | null) {
  if (rank === 1) return 'rank-gold';
  if (rank === 2) return 'rank-silver';
  if (rank === 3) return 'rank-bronze';
  return 'bg-amber-100 text-amber-800 border-2 border-amber-200';
}

function CrestPlaceholder({ name }: { name: string }) {
  const initial = name.charAt(0);
  
  // Map college name to logo filename
  const logoMap: Record<string, string> = {
    'NARASIMHA': 'Narasimha',
    'HANUMAN': 'Hanuman',
    'GANESHA': 'Ganesh',
    'GANESH': 'Ganesh',
    'GARUDA': 'Grauda',
    'THOR': 'Thor',
    'LOKI': 'Loki',
    'HELIOS': 'Helios',
    'OSIRIS': 'Osiris',
    'SURYA': 'Surya',
    'AGNI': 'Agni',
    'KUBERA': 'Kubera',
    'VARUNA': 'Varuna',
    'RUDRA': 'Rudra',
    'BALI': 'Bali',
  };

  const logoFilename = logoMap[name.toUpperCase().trim()];
  const logoPath = logoFilename ? `/CC LOGOS/${logoFilename}.png` : null;

  if (logoPath) {
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white border-2 border-amber-300 flex items-center justify-center flex-shrink-0">
        <Image
          src={logoPath}
          alt={name}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Fallback to letter circle if logo not found
  return (
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-400/40 to-amber-600/40 flex items-center justify-center font-cinzel text-sm sm:text-base font-bold text-amber-900 border-2 border-amber-300 flex-shrink-0">
      {initial}
    </div>
  );
}

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      setEntries(json.data);
      setLastUpdated(new Date(json.timestamp));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh every 15s + on tab focus
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 15000);

    const handleFocus = () => fetchLeaderboard();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchLeaderboard]);

  const allSleeping = entries.length > 0 && entries.every((e) => e.rank === null);

  return (
    <section className="relative z-10 px-4 py-8 max-w-3xl mx-auto w-full">
      {/* Section header */}
      <div className="text-center mb-6">
        <h2 className="font-cinzel-decorative text-xl sm:text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 font-bold drop-shadow">
          Hall of Legends
        </h2>
        <p className="text-amber-700 text-xs sm:text-sm font-inter mt-1 font-medium">
          Live Leaderboard
        </p>
      </div>

      {/* Status bar with last updated */}
      <div className="flex items-center justify-center gap-2 text-xs text-amber-600 font-medium mb-6">
        {error && (
          <span className="text-amber-400">Reconnecting…</span>
        )}
        {lastUpdated && (
          <span>
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <button
          onClick={fetchLeaderboard}
          className="p-1 hover:text-amber-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-amber-600"
          aria-label="Refresh leaderboard"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Leaderboard */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white/60 rounded-xl h-16 animate-pulse border-2 border-amber-100" />
          ))}
        </div>
      ) : allSleeping ? (
        <div className="text-center py-12">
          <p className="text-amber-700 font-cinzel text-lg font-semibold">— The legends are still sleeping —</p>
          <p className="text-amber-500 text-sm mt-2 font-inter">Rankings will appear once scores are assigned</p>
        </div>
      ) : (
        <LayoutGroup>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {entries.map((entry) => (
                <motion.div
                  key={entry.college_id}
                  layout
                  layoutId={`rank-${entry.college_id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="flex items-center gap-3 bg-white/70 hover:bg-white/90 backdrop-blur border-2 border-amber-200 hover:border-amber-300 rounded-xl p-3 sm:p-4 transition-all shadow-sm hover:shadow-md"
                >
                  {/* Rank badge */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getRankStyle(entry.rank)}`}>
                    {entry.rank ?? '—'}
                  </div>

                  {/* Crest */}
                  <CrestPlaceholder name={entry.name} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel font-semibold text-sm sm:text-base text-amber-900 truncate">
                        {entry.name}
                      </span>
                      {entry.rank === 1 && <span className="text-xs">👑</span>}
                    </div>
                  </div>

                  {/* Laurel for top 3 */}
                  {entry.rank && entry.rank <= 3 && (
                    <span className="text-lg sm:text-xl flex-shrink-0">
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      )}
    </section>
  );
}
