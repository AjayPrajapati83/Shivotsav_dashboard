'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BRANDING, DEVELOPER_CREDIT, LOGOS } from '@/config/branding';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        return;
      }

      router.push(data.redirectTo);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="dark min-h-dvh flex flex-col items-center justify-center relative overflow-hidden px-4 bg-black">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/shivotsav-hero-bg-muted.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" style={{ zIndex: 1 }} />

      {/* Main content */}
      <div className="relative w-full max-w-md flex flex-col items-center gap-6" style={{ zIndex: 10 }}>
        {/* Logos */}
        <div className="flex flex-col items-center gap-4 mb-2">
          {/* Shivotsav Logo */}
          <div className="golden-glow">
            <Image
              src={LOGOS.shivotsav}
              alt={BRANDING.festName}
              width={180}
              height={180}
              className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
              priority
            />
          </div>

          {/* Shivotsav Wordmark */}
          <Image
            src={LOGOS.shivotsavWordmark}
            alt="Shivotsav'26"
            width={360}
            height={90}
            className="w-52 sm:w-64 md:w-72 object-contain"
          />

          {/* ESSSqube & SVM logos with visible background */}
          <div className="flex items-center gap-5 bg-gradient-to-r from-amber-50/90 via-white/95 to-amber-50/90 rounded-2xl px-6 py-3 shadow-lg shadow-gold/10 border border-gold/20">
            <div className="flex flex-col items-center gap-1.5">
              <Image
                src={LOGOS.esssqube}
                alt={BRANDING.managedBy}
                width={64}
                height={64}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              />
              <span className="text-[11px] text-slate-600 font-inter font-medium">
                Managed by ESSSqube Events
              </span>
            </div>
            <div className="w-px h-14 bg-gold/30" />
            <div className="flex flex-col items-center gap-1.5">
              <Image
                src={LOGOS.svmCollege}
                alt={BRANDING.hostCollege}
                width={64}
                height={64}
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              />
              <span className="text-[11px] text-slate-600 font-inter font-medium">
                {BRANDING.hostCollege}
              </span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full bg-cosmic-100/80 backdrop-blur-xl border border-gold/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-gold/5">
          <h2 className="font-cinzel text-lg text-gold-light text-center mb-6">
            Enter the Arena
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-gold/70 font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="off"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-cosmic-200/50 border-gold/20 text-gold-light placeholder:text-gold/30 focus-visible:ring-gold/40"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-gold/70 font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-cosmic-200/50 border-gold/20 text-gold-light placeholder:text-gold/30 focus-visible:ring-gold/40 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/40 hover:text-gold/70 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 text-center" role="alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entering...
                </>
              ) : (
                'Enter the Arena'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative mt-8 pb-6 text-center safe-bottom" style={{ zIndex: 10 }}>
        <p className="text-gold text-sm font-inter mt-1 font-medium">
          {DEVELOPER_CREDIT}
        </p>
      </footer>
    </div>
  );
}
