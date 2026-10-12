'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  School,
  PlusCircle,
  MinusCircle,
  History,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { DEVELOPER_CREDIT } from '@/config/branding';

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Standings' },
  { href: '/admin/colleges', icon: School, label: 'Colleges' },
  { href: '/admin/assign', icon: PlusCircle, label: 'Assign Points' },
  { href: '/admin/deduct', icon: MinusCircle, label: 'Deduct Points' },
  { href: '/admin/history', icon: History, label: 'History' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-slate-50 font-inter flex flex-col">
      {/* Top bar (mobile) */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <h1 className="font-cinzel text-sm font-bold text-slate-800">
          SHIVOTSAV Admin
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-56 xl:w-64 bg-white border-r border-slate-200 flex-col fixed inset-y-0 left-0 z-30">
          <div className="p-4 border-b border-slate-100">
            <h1 className="font-cinzel text-base font-bold text-slate-800">
              SHIVOTSAV
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full min-h-[44px]"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          <div className="px-4 pb-3">
            <p className="text-[10px] text-slate-300">{DEVELOPER_CREDIT}</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-56 xl:ml-64 min-h-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 safe-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg min-w-[56px] min-h-[48px] transition-colors ${
                  isActive
                    ? 'text-amber-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium leading-tight text-center">
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer credit (mobile) */}
      <div className="lg:hidden fixed bottom-[68px] inset-x-0 text-center pb-1 pointer-events-none z-30">
        <p className="text-[9px] text-slate-300">{DEVELOPER_CREDIT}</p>
      </div>
    </div>
  );
}
