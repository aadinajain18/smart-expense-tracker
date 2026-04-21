import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getCategoryBreakdown } from '../utils/smartFeatures';
import { formatCurrency } from '../data/mockData';

// Curated color palette that matches the dark theme
const COLORS = [
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#ec4899', // pink
  '#14b8a6', // teal
  '#a855f7', // purple
  '#64748b', // slate
];

// Custom tooltip
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: data } = payload[0];

  return (
    <div className="bg-surface-hover border border-border rounded-xl px-4 py-3 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{data.icon}</span>
        <span className="text-sm font-semibold text-primary">{name}</span>
      </div>
      <p className="text-sm text-secondary tabular-nums">{formatCurrency(value)}</p>
      <p className="text-[11px] text-muted mt-0.5">
        {data.percentage}% of total · {data.count} {data.count === 1 ? 'txn' : 'txns'}
      </p>
    </div>
  );
}

// Custom legend
function CustomLegend({ payload }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
      {payload?.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-tertiary">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// Active shape label inside slices
function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) {
  if (percentage < 8) return null; // hide tiny labels
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      fill="#fff" fontSize={12} fontWeight={600}>
      {percentage}%
    </text>
  );
}

export default function CategoryPieChart({ expenses }) {
  const data = useMemo(() => getCategoryBreakdown(expenses), [expenses]);

  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center animate-fade-in">
        <p className="text-muted text-sm">No data for chart</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-primary mb-1 flex items-center gap-2">
        <span className="p-1.5 rounded-lg bg-violet-500/15 text-violet-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
        </span>
        Spending by Category
      </h2>
      <p className="text-xs text-muted mb-4 ml-9">Where your money goes</p>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={105}
            paddingAngle={2}
            strokeWidth={0}
            label={renderLabel}
            labelLine={false}
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, i) => (
              <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
