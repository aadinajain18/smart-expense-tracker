import { getCategoryMeta, formatCurrency, formatDate } from '../data/mockData';

export default function ExpenseList({ expenses, onDelete, loading, error, onRetry }) {
  // --- Loading skeleton ---
  if (loading) {
    return (
      <div className="card rounded-2xl overflow-hidden animate-fade-in">
        <div className="px-6 py-4 border-b border-border">
          <div className="h-5 w-40 bg-border rounded-lg animate-pulse" />
        </div>
        <ul className="divide-y divide-dark-700/30">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-border animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-border rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-surface-hover rounded-lg animate-pulse" />
              </div>
              <div className="h-4 w-16 bg-border rounded-lg animate-pulse" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="card border border-rose-500/10 bg-rose-500/5 rounded-2xl p-10 text-center animate-fade-in">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-rose-400 font-medium">{error}</p>
        <p className="text-muted opacity-50 text-sm mt-1 mb-4">
          Make sure the backend server is running on port 5001
        </p>
        <button
          onClick={onRetry}
          className="px-5 py-2 bg-border hover:bg-dark-600 rounded-xl text-sm font-medium text-primary cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // --- Empty state ---
  if (expenses.length === 0) {
    return (
      <div className="card rounded-2xl p-10 text-center animate-fade-in">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-tertiary font-medium">No expenses yet</p>
        <p className="text-muted opacity-50 text-sm mt-1">Add your first expense to get started</p>
      </div>
    );
  }

  // --- Expense list ---
  return (
    <div className="card rounded-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-4 py-4 sm:px-6 border-b border-divider flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-violet-500/15 text-violet-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </span>
          Recent Expenses
        </h2>
        <span className="text-xs text-muted bg-surface-hover px-3 py-1 rounded-full">
          {expenses.length} {expenses.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* List */}
      <ul className="divide-y divide-dark-700/30 stagger">
        {expenses.map((expense) => {
          const cat = getCategoryMeta(expense.category);
          return (
            <li
              key={expense._id}
              className="group px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 sm:gap-4 hover:bg-surface-hover/40 animate-fade-in"
            >
              {/* Category Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-lg border border-divider group-hover:border-border">
                {cat.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate leading-tight">{expense.title}</p>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                  <span className={`text-[11px] sm:text-xs font-medium ${cat.color}`}>{cat.label}</span>
                  <span className="text-muted text-[10px]">·</span>
                  <span className="text-[11px] text-muted">{formatDate(expense.date)}</span>
                </div>
              </div>

              {/* Amount */}
              <span className="text-[13px] sm:text-sm font-semibold text-primary tabular-nums whitespace-nowrap">
                {formatCurrency(expense.amount)}
              </span>

              {/* Delete button (Always visible on mobile, hover on desktop) */}
              <button
                onClick={() => onDelete(expense._id)}
                className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all active:scale-95"
                aria-label={`Delete ${expense.title}`}
              >
                <svg className="w-5 h-5 lg:w-4 lg:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
