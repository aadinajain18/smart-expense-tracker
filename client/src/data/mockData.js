export const CATEGORIES = [
  { value: 'Food & Dining', label: 'Food & Dining', icon: '🍕', color: 'text-amber-400' },
  { value: 'Transportation', label: 'Transportation', icon: '🚕', color: 'text-cyan-400' },
  { value: 'Shopping', label: 'Shopping', icon: '🛍️', color: 'text-violet-400' },
  { value: 'Entertainment', label: 'Entertainment', icon: '🎬', color: 'text-rose-400' },
  { value: 'Bills & Utilities', label: 'Bills & Utilities', icon: '💡', color: 'text-accent-400' },
  { value: 'Health & Fitness', label: 'Health & Fitness', icon: '💪', color: 'text-green-400' },
  { value: 'Travel', label: 'Travel', icon: '✈️', color: 'text-blue-400' },
  { value: 'Education', label: 'Education', icon: '📚', color: 'text-indigo-400' },
  { value: 'Personal Care', label: 'Personal Care', icon: '💅', color: 'text-pink-400' },
  { value: 'Other', label: 'Other', icon: '📦', color: 'text-dark-300' },
];

export const MOCK_EXPENSES = [
  {
    _id: '1',
    title: 'Grocery shopping at BigBasket',
    amount: 2450,
    category: 'Food & Dining',
    date: '2026-04-10T00:00:00.000Z',
  },
  {
    _id: '2',
    title: 'Uber to office',
    amount: 320,
    category: 'Transportation',
    date: '2026-04-09T00:00:00.000Z',
  },
  {
    _id: '3',
    title: 'Netflix subscription',
    amount: 649,
    category: 'Entertainment',
    date: '2026-04-08T00:00:00.000Z',
  },
  {
    _id: '4',
    title: 'New running shoes',
    amount: 4999,
    category: 'Shopping',
    date: '2026-04-07T00:00:00.000Z',
  },
  {
    _id: '5',
    title: 'Electricity bill',
    amount: 1850,
    category: 'Bills & Utilities',
    date: '2026-04-06T00:00:00.000Z',
  },
  {
    _id: '6',
    title: 'Gym membership',
    amount: 1500,
    category: 'Health & Fitness',
    date: '2026-04-05T00:00:00.000Z',
  },
];

export const getCategoryMeta = (categoryName) => {
  return CATEGORIES.find((c) => c.value === categoryName) || CATEGORIES[CATEGORIES.length - 1];
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
