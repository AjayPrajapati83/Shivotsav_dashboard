'use client';

import Image from 'next/image';
import { SPONSORS } from '@/config/sponsors';

export function SponsorStrip() {
  if (SPONSORS.length === 0) return null;

  return (
    <section className="relative z-10 py-16 px-4 bg-gradient-to-b from-transparent via-amber-50/30 to-transparent">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-cinzel-decorative text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 text-2xl md:text-3xl font-bold mb-2">
          Our Sponsors
        </h2>
        <p className="text-center text-amber-600 text-sm font-inter mb-10 font-medium">
          Thank you to our partners who make this event possible
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 items-center justify-items-center">
          {SPONSORS.map((sponsor) => (
            <div
              key={sponsor.name}
              className="bg-white/80 backdrop-blur border-2 border-amber-200 rounded-xl p-4 sm:p-5 w-full flex items-center justify-center hover:border-amber-400 hover:shadow-lg transition-all duration-300 min-h-[100px] sm:min-h-[120px] group"
            >
              {sponsor.href ? (
                <a
                  href={sponsor.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform"
                >
                  <Image
                    src={sponsor.src}
                    alt={sponsor.name}
                    width={150}
                    height={80}
                    className="w-full max-w-[120px] h-auto object-contain"
                  />
                </a>
              ) : (
                <Image
                  src={sponsor.src}
                  alt={sponsor.name}
                  width={150}
                  height={80}
                  className="w-full max-w-[120px] h-auto object-contain group-hover:scale-105 transition-transform"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
