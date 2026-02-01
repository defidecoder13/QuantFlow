'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // We can pass metadata here if we want to default a name
        data: {
          full_name: email.split('@')[0], 
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
        // If 'data.session' is present, it means auto-confirm is enabled or no confirm needed.
        if (data.session) {
            router.push('/');
            router.refresh();
        } else {
            // Fallback just in case (though user said it's disabled)
            setError('Please check your email to confirm your account.');
            setLoading(false);
        }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md p-8 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-500 mb-4 shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <Sparkles className="text-white opacity-80" size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="text-zinc-400 text-sm mt-2">Join QuantFlow and start building algorithms</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs uppercase font-bold text-zinc-500 ml-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs uppercase font-bold text-zinc-500 ml-1">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-zinc-600"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className={`p-3 border rounded-lg text-xs font-bold text-center animate-in fade-in slide-in-from-top-2 ${error.includes('check your email') ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
          <p className="text-zinc-500 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-bold hover:underline transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
