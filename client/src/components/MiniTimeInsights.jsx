import { useMemo } from 'react';
import { formatCurrency } from '../data/mockData';

export default function MiniTimeInsights({ expenses, loading }) {
  const { todayTotal, weekTotal, yesterdayTotal } = useMemo(() => {
    if (!expenses || expenses.length === 0) return { todayTotal: 0, weekTotal: 0, yesterdayTotal: 0 };

    const now = new Date();
    const todayStr = now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let t = 0, y = 0, w = 0;

    expenses.forEach((e) => {
      const d = new Date(e.date);
      const dStr = d.toDateString();
      if (dStr === todayStr) t += e.amount;
      if (dStr === yesterdayStr) y += e.amount;
      if (d >= oneWeekAgo) w += e.amount;
    });

    return { todayTotal: t, weekTotal: w, yesterdayTotal: y };
  }, [expenses]);

  if (loading || expenses.length === 0) return null;

  // Trend logic
  const isUp = todayTotal > yesterdayTotal;
  const percentage = yesterdayTotal > 0 ? Math.round(Math.abs((todayTotal - yesterdayTotal) / yesterdayTotal) * 100) : null;

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
      <div className="flex-1 card rounded-xl p-3 sm:p-4 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
           <span className="text-[17px]">⏱️</span>
           <span className="text-xs font-semibold text-tertiary uppercase tracking-wider">Today's Pulse</span>
        </div>
        <div className="flex items-end gap-2">
           <span className="text-xl font-bold text-primary tabular-nums">{formatCurrency(todayTotal)}</span>
           {percentage !== null ? (
               <span className={`text-[11px] font-medium mb-1 ${isUp ? 'text-rose-500' : 'text-emerald-500'}`}>
                 {isUp ? '↑' : '↓'} {percentage}% vs yesterday
               </span>
           ) : (
               <span className="text-[11px] font-medium text-muted mb-1">No spending yesterday</span>
           )}
        </div>
      </div>
      
      <div className="flex-1 card rounded-xl p-3 sm:p-4 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
           <span className="text-[17px]">📅</span>
           <span className="text-xs font-semibold text-tertiary uppercase tracking-wider">7-Day Summary</span>
        </div>
        <div className="flex items-end gap-2">
           <span className="text-xl font-bold text-primary tabular-nums">{formatCurrency(weekTotal)}</span>
           {weekTotal > 0 && todayTotal > 0 && (
             <span className="text-[11px] font-medium text-muted mb-1">
               (Today is {Math.round((todayTotal/weekTotal)*100)}% of weekly)
             </span>
           )}
        </div>
      </div>
    </div>
  );
}
