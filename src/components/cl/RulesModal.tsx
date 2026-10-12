'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SCORING_RULES, CODE_LABELS } from '@/lib/scoring';
import type { EventType } from '@/lib/types';

const EVENT_TYPES: EventType[] = ['Flagship', 'Large', 'Small'];

const CODE_ORDER = [
  'PODIUM_1', 'PODIUM_2', 'PODIUM_3',
  'PARTICIPATION', 'OTSE',
  'NPOOR', 'NPOR', 'NPOQ',
] as const;

const CODE_TOOLTIPS: Record<string, string> = {
  PARTICIPATION: 'Points for participating in the event',
  OTSE: 'Points for on-the-spot event participation/registration',
  NPOOR: 'Penalty for non-participation after online registration',
  NPOR: 'Penalty for non-participation after registration',
  NPOQ: 'Penalty for non-participation on qualification',
  PODIUM_1: 'Points for winning 1st place',
  PODIUM_2: 'Points for winning 2nd place',
  PODIUM_3: 'Points for winning 3rd place',
};

export function RulesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal / Bottom sheet on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed z-50 inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-cosmic-100 border border-gold/20 rounded-t-2xl sm:rounded-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto w-full sm:max-w-2xl shadow-2xl"
          >
            {/* Drag handle on mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gold/20" />
            </div>

            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-cinzel text-lg sm:text-xl text-gold font-semibold">
                  📜 Scoring Rules
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-cosmic-200 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close"
                >
                  <X size={18} className="text-gold/50" />
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold/10">
                      <th className="text-left text-gold/50 font-inter font-medium py-2 pr-3 text-xs">Code</th>
                      {EVENT_TYPES.map((t) => (
                        <th key={t} className="text-center text-gold/50 font-inter font-medium py-2 px-2 text-xs">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CODE_ORDER.map((code) => (
                      <tr key={code} className="border-b border-gold/5 hover:bg-cosmic-200/30 transition-colors">
                        <td className="py-2.5 pr-3">
                          <div className="font-medium text-gold-light text-xs sm:text-sm">
                            {CODE_LABELS[code]}
                          </div>
                          <div className="text-[10px] text-gold/30 mt-0.5 hidden sm:block">
                            {CODE_TOOLTIPS[code]}
                          </div>
                        </td>
                        {EVENT_TYPES.map((type) => {
                          const rule = SCORING_RULES.find(
                            (r) => r.event_type === type && r.code === code
                          );
                          const pts = rule?.points ?? 0;
                          return (
                            <td key={type} className={`text-center py-2.5 px-2 font-mono text-xs sm:text-sm font-medium ${
                              pts > 0 ? 'text-emerald-400' : pts < 0 ? 'text-red-400' : 'text-gold/30'
                            }`}>
                              {pts > 0 ? `+${pts}` : pts}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Special bonuses */}
              <div className="mt-4 pt-4 border-t border-gold/10">
                <h4 className="text-gold/60 text-xs font-semibold uppercase tracking-wider mb-2">
                  Special Bonuses
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gold/70">
                    <span>Full Slot Participation</span>
                    <span className="text-emerald-400 font-mono">+2000</span>
                  </div>
                  <div className="flex justify-between text-gold/70">
                    <span>PR Rally Participation</span>
                    <span className="text-emerald-400 font-mono">+500</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
