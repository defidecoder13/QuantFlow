'use client';

import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                 <div className="p-4 bg-zinc-900 rounded-full">
                    <ShieldCheck className="w-8 h-8 text-zinc-600" />
                 </div>
                 <h3 className="text-lg font-medium text-zinc-300">Settings Unavailable</h3>
                 <p className="text-zinc-500 max-w-md">
                   Real trading configuration and risk controls will be enabled in a future update. 
                   Currently, the platform operates in Paper Trading mode which requires no additional setup.
                 </p>
              </div>
            </div>
          </div>
        </main>
      </div>
      

    </div>
  );
}