import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getMonthlySummary } from '../utils/smartFeatures';
import { formatCurrency } from '../data/mockData';

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="bg-surface-hover border border-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-primary mb-0.5">{item.label}</p>
      <p className="text-sm text-accent-400 tabular-nums">{formatCurrency(item.total)}</p>
      <p className="text-[11px] text-muted mt-0.5">
        {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
      </p>
    </div>
  );
}

// Custom Y-axis tick (shortened currency)
function formatYAxis(value) {
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

export default function MonthlyBarChart({ expenses }) {
  // Reverse so oldest is on the left (chronological)
  const data = useMemo(() => getMonthlySummary(expenses).reverse(), [expenses]);

  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center animate-fade-in">
        <p className="text-muted text-sm">No data for chart</p>
      </div>
    );
  }

  // Short month labels for X-axis
  const chartData = data.map((m) => ({
    ...m,
    shortLabel: m.label.split(' ')[0].slice(0, 3),
  }));

  const maxTotal = Math.max(...data.map((m) => m.total));

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-primary mb-1 flex items-center gap-2">
        <span className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </span>
        Monthly Spending
      </h2>
      <p className="text-xs text-muted mb-4 ml-9">Your spending trend over time</p>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barCategoryGap="20%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="shortLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#62627a', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#62627a', fontSize: 11 }}
            tickFormatter={formatYAxis}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="total" radius={[8, 8, 0, 0]} animationDuration={800}>
            {chartData.map((entry, i) => {
              // Intensity based on how close to max
              const opacity = 0.5 + (entry.total / maxTotal) * 0.5;
              return (
                <Cell
                  key={entry.key}
                  fill={`rgba(16, 185, 129, ${opacity})`}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
