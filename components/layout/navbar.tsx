'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, Zap, History, FileText, Settings, PlayCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/features/auth/user-profile';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

const NavItem = ({ href, label, icon, isActive }: NavItemProps) => (
  <Link href={href}>
    <Button
      variant="ghost"
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
        isActive 
          ? 'text-cyan-400 bg-cyan-400/10' 
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
      }`}
    >
      {icon}
      {label}
    </Button>
  </Link>
);

export const Navbar = () => {
  const pathname = usePathname();

  const getIsActive = (path: string) => pathname === path;

  return (
    <nav className="flex items-center justify-between px-6 h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center shadow-sm">
            <Activity className="w-4 h-4 text-zinc-300" />
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-200">
            QuantFlow
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          <NavItem href="/" label="Dashboard" icon={<LayoutDashboard size={18} />} isActive={getIsActive('/')} />
          <NavItem href="/market" label="Market" icon={<TrendingUp size={18} />} isActive={getIsActive('/market')} />
          <NavItem href="/strategy" label="Strategy" icon={<Zap size={18} />} isActive={getIsActive('/strategy')} />
          <NavItem href="/backtest" label="Backtest" icon={<History size={18} />} isActive={getIsActive('/backtest')} />
          <NavItem href="/paper" label="Paper" icon={<PlayCircle size={18} />} isActive={getIsActive('/paper')} />
          <NavItem href="/activity" label="Activity" icon={<FileText size={18} />} isActive={getIsActive('/activity')} />
          <NavItem href="/settings" label="Settings" icon={<Settings size={18} />} isActive={getIsActive('/settings')} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-500">Live Connection</span>
        </div>
        <UserProfile />
      </div>
    </nav>
  );
};