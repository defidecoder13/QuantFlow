'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { LogOut, ChevronDown } from 'lucide-react';

export const UserProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  const email = user?.email || 'guest';
  // Use 'avataaars' style for character look
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${email}`;

  return (
    <div className="relative">
       <button 
         onClick={() => setIsOpen(!isOpen)}
         className="flex items-center gap-2 hover:bg-zinc-900 rounded-full p-1 pr-3 border border-transparent hover:border-zinc-800 transition-all outline-none"
       >
         <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
         </div>
         <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
       </button>

       {isOpen && (
         <>
           <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
           <div className="absolute right-0 top-12 z-50 w-64 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 border-b border-zinc-800 mb-2">
                 <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Signed in as</p>
                 <p className="text-sm font-medium text-zinc-200 truncate" title={user?.email}>{user?.email || 'Guest User'}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
           </div>
         </>
       )}
    </div>
  );
}
