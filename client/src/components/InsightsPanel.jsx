import { useMemo, useState, useEffect } from 'react';
import { getMonthlySummary, getCategoryBreakdown } from '../utils/smartFeatures';
import { formatCurrency } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function InsightsPanel({ expenses }) {
  const [activeTab, setActiveTab] = useState('category');
  const [backendInsights, setBackendInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const { user, updateBudget } = useAuth();

  const categoryData = useMemo(() => getCategoryBreakdown(expenses), [expenses]);
  const monthlyData = useMemo(() => getMonthlySummary(expenses), [expenses]);

  useEffect(() => {
    // Fetch insights from the backend whenever expenses change
    if (activeTab === 'insights') {
      const fetchInsights = async () => {
        setLoadingInsights(true);
        try {
          const res = await authAPI.getInsights();
          setBackendInsights(res.data);
        } catch (error) {
          console.error("Failed to fetch backend insights", error);
        }
        setLoadingInsights(false);
      };
      fetchInsights();
    }
  }, [expenses, activeTab]);

  if (expenses.length === 0) return null;

  const tabs = [
    { id: 'category', label: 'By Category' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'insights', label: 'AI Insights' },
  ];

  const barColors = [
    'from-accent-500 to-cyan-500',
    'from-violet-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-blue-500 to-indigo-500',
  ];

  return (
    <div className="card rounded-2xl overflow-hidden animate-fade-in">
      {/* Header with tabs */}
      <div className="px-6 py-4 border-b border-divider">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </span>
            Insights
          </h2>

          <div className="flex gap-1 bg-surface-hover rounded-lg p-0.5 overflow-x-auto select-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-surface border border-divider text-primary shadow-sm'
                    : 'text-muted hover:text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'category' ? (
          <CategoryView data={categoryData} barColors={barColors} user={user} updateBudget={updateBudget} />
        ) : activeTab === 'monthly' ? (
          <MonthlyView data={monthlyData} />
        ) : (
          <SmartInsightsView data={backendInsights} loading={loadingInsights} />
        )}
      </div>
    </div>
  );
}

// ─── Category Breakdown View ──────────────────
function CategoryView({ data, barColors, user, updateBudget }) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');

  if (data.length === 0) {
    return <p className="text-muted text-sm text-center py-4">No data to display</p>;
  }

  const handleSaveBudget = async (category) => {
    const num = parseFloat(budgetInput);
    if (!isNaN(num)) {
      await updateBudget(category, num);
    }
    setEditingCategory(null);
  };

  const handleClearBudget = async (category) => {
    await updateBudget(category, 0);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-4 stagger">
      {data.map((item, i) => {
        const budget = user?.budgets?.[item.category] || null;
        const isOverBudget = budget ? item.total > budget : false;
        const isEditing = editingCategory === item.category;

        return (
          <div key={item.category} className="animate-fade-in group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base">{item.icon}</span>
                <span className="text-sm font-medium text-primary">{item.category}</span>
                <span className="text-[11px] text-muted">
                  {item.count} {item.count === 1 ? 'txn' : 'txns'}
                </span>
                {isOverBudget && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded ml-1 animate-pulse">
                    Over Limit
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold tabular-nums ${isOverBudget ? 'text-rose-500' : 'text-primary'}`}>
                  {item.formattedTotal}
                </span>
                
                {!isEditing && (
                  <button 
                    onClick={() => {
                       setEditingCategory(item.category);
                       setBudgetInput(budget || '');
                    }}
                    className="text-[10px] text-muted hover:text-accent-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {budget ? `Limit: ${formatCurrency(budget)} ✎` : '+ Limit'}
                  </button>
                )}
              </div>
            </div>

            {isEditing && (
               <div className="flex items-center gap-2 mb-2 animate-fade-in bg-input p-2 rounded-lg border border-divider">
                 <span className="text-xs text-tertiary">Set Limit: ₹</span>
                 <input 
                   type="number"
                   value={budgetInput}
                   onChange={(e) => setBudgetInput(e.target.value)}
                   className="bg-surface border border-divider rounded px-2 py-1 text-xs text-primary w-20 focus:border-accent-500"
                   autoFocus placeholder="0"
                 />
                 <button onClick={() => handleSaveBudget(item.category)} className="text-xs bg-accent-500/10 text-accent-600 px-2 py-1 rounded hover:bg-accent-500/20">Save</button>
                 <button onClick={() => setEditingCategory(null)} className="text-xs text-muted hover:text-primary px-1">Cancel</button>
                 {budget && <button onClick={() => handleClearBudget(item.category)} className="text-xs text-rose-500 hover:text-rose-600 px-1 ml-auto">Clear</button>}
               </div>
            )}

            <div className="h-2 bg-surface-hover rounded-full overflow-hidden flex">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${isOverBudget ? 'from-rose-500 to-rose-600' : barColors[i % barColors.length]}`}
                style={{
                  width: `${isOverBudget ? 100 : (budget ? (item.total / budget) * 100 : item.percentage)}%`,
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Monthly Summary View ─────────────────────
function MonthlyView({ data }) {
  if (data.length === 0) {
    return <p className="text-muted text-sm text-center py-4">No data to display</p>;
  }

  const maxTotal = Math.max(...data.map((m) => m.total));

  return (
    <div className="space-y-3 stagger">
      {data.map((month) => (
        <div key={month.key} className="flex items-center gap-4 p-3 rounded-xl bg-surface-hover/50 hover:bg-surface-hover animate-fade-in">
          <div className="flex-shrink-0 w-24">
            <p className="text-sm font-medium text-primary">{month.label.split(' ')[0]}</p>
            <p className="text-[11px] text-muted">{month.label.split(' ')[1]}</p>
          </div>
          <div className="flex-1 h-3 bg-divider/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-500 to-cyan-500"
              style={{
                width: `${maxTotal > 0 ? (month.total / maxTotal) * 100 : 0}%`,
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-semibold text-primary tabular-nums">{formatCurrency(month.total)}</p>
            <p className="text-[11px] text-muted">{month.count} {month.count === 1 ? 'txn' : 'txns'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Smart AI Insights View ───────────────────
function SmartInsightsView({ data, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
         <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
         <p className="text-sm text-muted">Analyzing your spending behavior...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-muted text-sm text-center py-4">Not enough data to calculate insights.</p>;
  }

  // Highlight percentages and currency numbers
  const highlightText = (text) => {
    const parts = text.split(/((?:₹|\$)?\d+(?:,\d+)*(?:\.\d+)?(?:%|x)?)/g);
    return parts.map((part, i) => {
      if (/((?:₹|\$)?\d+(?:,\d+)*(?:\.\d+)?(?:%|x)?)/.test(part)) {
         return <span key={i} className="font-bold text-primary">{part}</span>;
      }
      return <span key={i} className="text-secondary">{part}</span>;
    });
  };

  return (
    <div className="space-y-3 stagger">
      {data.map((insight, idx) => {
        const lowerText = insight.toLowerCase();
        let iconMarkup = null;
        let containerClass = "bg-surface border-divider hover:shadow-md hover:-translate-y-0.5";
        let iconBg = "bg-accent-500/10 text-accent-500";

        if (lowerText.includes('more') || lowerText.includes('up') || lowerText.includes('increased')) {
          iconMarkup = (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          );
          iconBg = "bg-rose-500/10 text-rose-500";
        } else if (lowerText.includes('less') || lowerText.includes('down') || lowerText.includes('great')) {
          iconMarkup = (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.514m-3.182 5.514l-5.511-3.181" />
            </svg>
          );
          iconBg = "bg-emerald-500/10 text-emerald-500";
        } else {
          iconMarkup = (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.829 1.508-2.336A8.002 8.002 0 0015 4.5h-6A8.002 8.002 0 002.992 15.5c.85.507 1.508 1.353 1.508 2.336V18" />
            </svg>
          );
          iconBg = "bg-blue-500/10 text-blue-500";
        }

        return (
          <div key={idx} className={`p-4 rounded-xl border flex gap-3 transition-all cursor-default ${containerClass} animate-fade-in`}>
            <div className={`p-2 rounded-lg flex-shrink-0 self-start ${iconBg}`}>
              {iconMarkup}
            </div>
            <p className="text-[13px] leading-relaxed pt-0.5">
              {highlightText(insight)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
