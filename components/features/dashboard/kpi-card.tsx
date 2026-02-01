import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  trend: number;
  icon: React.ElementType;
  color: string;
}

const KPICard = ({ label, value, trend, icon: Icon, color }: KPICardProps) => (
  <div className="glass p-5 rounded-xl flex flex-col gap-3 relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-110 transition-transform ${color}`} />
    <div className="flex items-center justify-between">
      <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
        <Icon size={20} className="text-zinc-400" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(trend)}%
      </div>
    </div>
    <div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white font-mono mt-1">{value}</p>
    </div>
  </div>
);

export default KPICard;