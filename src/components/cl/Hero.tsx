'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { BRANDING, LOGOS } from '@/config/branding';

export function Hero() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center px-4 overflow-hidden min-h-screen">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ zIndex: -1 }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/shivotsav-hero-bg-muted.mp4" type="video/mp4" />
        </video>
        {/* Subtle dark overlay for text readability only */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* SVM Logo - Top Left Corner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-4 left-4 z-20"
      >
        <Image
          src={LOGOS.svmCollege}
          alt={BRANDING.hostCollege}
          width={80}
          height={80}
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-2xl"
          priority
        />
      </motion.div>

      {/* Logos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center gap-6"
      >

        {/* Shivotsav Logo — largest */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="golden-glow"
        >
          <Image
            src={LOGOS.shivotsav}
            alt={BRANDING.festName}
            width={220}
            height={220}
            className="w-40 h-40 sm:w-52 sm:h-52 md:w-56 md:h-56 object-contain"
            priority
          />
        </motion.div>

        {/* Shivotsav Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <Image
            src={LOGOS.shivotsavWordmark}
            alt="Shivotsav'26"
            width={400}
            height={100}
            className="w-56 sm:w-72 md:w-80 lg:w-96 object-contain"
          />
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 font-cinzel-decorative text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider leading-tight mt-3 drop-shadow-2xl" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
            MYTHOS
          </span>
          <span className="block text-amber-200 text-sm sm:text-base md:text-lg font-cinzel tracking-[0.3em] mt-2 uppercase font-semibold drop-shadow-lg" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
            The Legend Awakens
          </span>
        </motion.div>

        {/* ESSSqube logo + label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-2"
        >
          <div className="bg-black/40 backdrop-blur-md border-2 border-white/20 rounded-2xl px-5 py-3 shadow-2xl">
            <div className="flex items-center gap-2">
              <Image
                src={LOGOS.esssqube}
                alt={BRANDING.managedBy}
                width={52}
                height={52}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <div className="text-left">
                <span className="block text-amber-300 text-[10px] sm:text-xs font-inter uppercase tracking-wider font-medium drop-shadow-md">
                  Managed by
                </span>
                <span className="block text-white text-xs sm:text-sm font-inter font-semibold drop-shadow-lg">
                  {BRANDING.managedBy}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Golden Particles Effect - Enhanced */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {[...Array(60)].map((_, i) => {
          const delay = Math.random() * 8;
          const duration = 4 + Math.random() * 6;
          const left = Math.random() * 100;
          const startY = 100 + Math.random() * 20;
          const size = 3 + Math.random() * 6;
          const blur = Math.random() > 0.5 ? 1 : 2;
          
          return (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                y: `${startY}vh`,
                x: `${left}vw`
              }}
              animate={{ 
                opacity: [0, 0.7, 1, 0.7, 0],
                y: [null, `${startY - 40}vh`, `${startY - 80}vh`, `${startY - 120}vh`, '-20vh'],
                x: [null, `${left + (Math.random() - 0.5) * 15}vw`, `${left + (Math.random() - 0.5) * 20}vw`]
              }}
              transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                background: `radial-gradient(circle, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.6) 50%, rgba(217, 119, 6, 0.3) 100%)`,
                filter: `blur(${blur}px)`,
                boxShadow: '0 0 12px rgba(251, 191, 36, 0.8), 0 0 24px rgba(251, 191, 36, 0.4)'
              }}
            />
          );
        })}
        
        {/* Additional sparkle particles */}
        {[...Array(40)].map((_, i) => {
          const delay = Math.random() * 6;
          const duration = 2 + Math.random() * 3;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          
          return (
            <motion.div
              key={`sparkle-${i}`}
              initial={{ 
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute rounded-full"
              style={{
                width: '2px',
                height: '2px',
                left: `${left}%`,
                top: `${top}%`,
                background: 'rgba(253, 224, 71, 0.9)',
                boxShadow: '0 0 4px rgba(253, 224, 71, 1), 0 0 8px rgba(251, 191, 36, 0.8)'
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
