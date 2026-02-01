import KPICard from './kpi-card';
import { Wallet, TrendingUp, Cpu, PieChart } from 'lucide-react';

export const DashboardKPIs = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <KPICard label="Total Balance" value="$52,450.22" trend={2.4} icon={Wallet} color="bg-cyan-500" />
      <KPICard label="Net Profit" value="+$4,231.00" trend={12.8} icon={TrendingUp} color="bg-emerald-500" />
      <KPICard label="Win Rate" value="68.4%" trend={-1.2} icon={PieChart} color="bg-purple-500" />
      <KPICard label="Active Bots" value="12" trend={5.5} icon={Cpu} color="bg-blue-500" />
    </div>
  );
};