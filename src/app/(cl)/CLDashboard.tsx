'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Starfield } from '@/components/cl/Starfield';
import { Hero } from '@/components/cl/Hero';
import { Leaderboard } from '@/components/cl/Leaderboard';
import { EventGrid } from '@/components/cl/EventGrid';
import { SponsorStrip } from '@/components/cl/SponsorStrip';
import { BRANDING, DEVELOPER_CREDIT, LOGOS } from '@/config/branding';
import type { Event } from '@/lib/types';
import Image from 'next/image';

export function CLDashboard({ events }: { events: Event[] }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-x-hidden">
      {/* Ancient parchment texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
           }} 
      />
      
      {/* Subtle golden particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-yellow-400/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-orange-400/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-amber-400/20 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Logout button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border-2 border-amber-200 hover:border-amber-400 rounded-lg px-4 py-2 text-sm text-amber-900 hover:text-amber-700 font-medium shadow-lg hover:shadow-xl transition-all min-h-[44px]"
          aria-label="Logout"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Hero */}
      <Hero />

      {/* Leaderboard */}
      <Leaderboard />

      {/* Divider */}
      <div className="relative z-10 max-w-xs mx-auto py-4">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      </div>

      {/* Events */}
      <EventGrid events={events} />

      {/* Sponsors */}
      <SponsorStrip />

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-b from-amber-100/50 to-amber-200/30 border-t-2 border-amber-300">
        <div className="container mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About / Brand */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={LOGOS.shivotsav}
                  alt={BRANDING.festName}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 font-cinzel-decorative">
                    SHIVOTSAV
                  </h4>
                </div>
              </div>
              <p className="text-amber-700 mb-4 text-sm font-medium">
                27th & 28th November • SVM College, Vasai (East)
              </p>
              <div className="flex flex-col gap-3 mt-2">
                <a
                  href="https://www.instagram.com/shivotsavsvm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </div>
                  <span className="text-amber-800 group-hover:text-pink-600 transition-colors text-sm font-semibold">
                    @shivotsavsvm
                  </span>
                </a>
                <a
                  href="https://www.instagram.com/esssqube_events"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </div>
                  <span className="text-amber-800 group-hover:text-pink-600 transition-colors text-sm font-semibold">
                    @esssqube_events
                  </span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col items-start md:items-center">
              <h3 className="text-xl font-bold text-amber-900 mb-6 font-cinzel">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <span className="text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-2 font-medium text-sm cursor-default">
                    <span className="text-amber-500">→</span>
                    Dashboard
                  </span>
                </li>
                <li>
                  <span className="text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-2 font-medium text-sm cursor-default">
                    <span className="text-amber-500">→</span>
                    Leaderboard
                  </span>
                </li>
                <li>
                  <span className="text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-2 font-medium text-sm cursor-default">
                    <span className="text-amber-500">→</span>
                    Events
                  </span>
                </li>
                <li>
                  <span className="text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-2 font-medium text-sm cursor-default">
                    <span className="text-amber-500">→</span>
                    Sponsors
                  </span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="flex flex-col items-start md:items-start">
              <h3 className="text-xl font-bold text-amber-900 mb-6 font-cinzel">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-amber-700">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">svm.shivotsav26@gmail.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-amber-700">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">+91 73043 83036 (Shree)</p>
                    <p className="text-sm font-medium">+91 93218 82776 (Pratham)</p>
                    <p className="text-sm font-medium">+91 836956 4372 (Ajay)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-amber-700">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Sheth Vidya Mandir</p>
                    <p className="text-sm font-medium">Vasant Nagri, Vasai (East)</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-center gap-4 mt-12 mb-8">
            {/* Managed by */}
            <a
              href="https://www.essqube.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/80 backdrop-blur border-2 border-amber-300 hover:border-amber-400 rounded-full px-6 py-3 flex items-center gap-2 hover:scale-105 transition-all shadow-lg group"
            >
              <span className="text-amber-700 text-xs font-medium">Managed by</span>
              <div className="w-7 h-7 rounded-full bg-amber-100 p-1 flex items-center justify-center">
                <Image
                  src={LOGOS.esssqube}
                  alt="ESSSqube"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 group-hover:from-amber-700 group-hover:to-yellow-700">
                ESSSQUBE EVENTS
              </span>
            </a>

            {/* Developed by */}
            <a
              href="https://www.linkedin.com/in/ajayprajapatii"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/80 backdrop-blur border-2 border-red-300 hover:border-red-400 rounded-full px-6 py-3 flex items-center gap-2 hover:scale-105 transition-all shadow-lg group"
            >
              <span className="text-amber-700 text-xs font-medium">Developed with</span>
              <svg className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="text-amber-700 text-xs font-medium">by</span>
              <span className="font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 group-hover:from-red-600 group-hover:to-pink-600">
                Ajay Prajapati
              </span>
            </a>
          </div>

          {/* Bottom */}
          <div className="border-t-2 border-amber-300 pt-6 mt-6">
            <p className="text-center text-amber-700 text-sm font-medium">
              © 2026 All rights reserved to Ajay Prajapati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
