'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, Zap, History, FileText, Settings, PlayCircle, TrendingUp, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/features/auth/user-profile';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

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
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-500">Live Connection</span>
        </div>
        <UserProfile />
        
        {/* Mobile Menu */}
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
                        <Menu size={24} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-zinc-950 border-l border-zinc-800 p-0">
                    <VisuallyHidden.Root>
                        <SheetTitle>Menu</SheetTitle>
                        <SheetDescription>Mobile Navigation</SheetDescription>
                    </VisuallyHidden.Root>
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-zinc-800 flex items-center gap-2">
                             <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center shadow-sm">
                                <Activity className="w-4 h-4 text-zinc-300" />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-zinc-200">
                                QuantFlow
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 p-4">
                            <NavItem href="/" label="Dashboard" icon={<LayoutDashboard size={18} />} isActive={getIsActive('/')} />
                            <NavItem href="/market" label="Market" icon={<TrendingUp size={18} />} isActive={getIsActive('/market')} />
                            <NavItem href="/strategy" label="Strategy" icon={<Zap size={18} />} isActive={getIsActive('/strategy')} />
                            <NavItem href="/backtest" label="Backtest" icon={<History size={18} />} isActive={getIsActive('/backtest')} />
                            <NavItem href="/paper" label="Paper" icon={<PlayCircle size={18} />} isActive={getIsActive('/paper')} />
                            <NavItem href="/activity" label="Activity" icon={<FileText size={18} />} isActive={getIsActive('/activity')} />
                            <NavItem href="/settings" label="Settings" icon={<Settings size={18} />} isActive={getIsActive('/settings')} />
                        </div>
                        <div className="mt-auto p-4 border-t border-zinc-800">
                             <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-medium text-emerald-500">Live Connection</span>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </nav>
  );
};