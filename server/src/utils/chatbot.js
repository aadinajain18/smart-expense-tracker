import { getExpensesForMonth, calculateMonthlyTotal } from './analytics.js';

/**
 * A simple rule-based chatbot for answering basic expense queries.
 * @param {string} query - The user's natural language input string.
 * @param {Array} expenses - The user's array of expense objects.
 * @returns {string} The structured response.
 */
export const processChatQuery = (query, expenses) => {
  if (!query || typeof query !== 'string') {
    return "I didn't quite catch that. Could you ask me something about your expenses?";
  }

  if (!expenses || expenses.length === 0) {
    return "It looks like you don't have any logged expenses yet.";
  }

  const normalized = query.toLowerCase().trim();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Intent: Spending this month
  if (
    normalized.includes('how much did i spend this month') ||
    normalized.includes('total this month') ||
    (normalized.includes('spent') && normalized.includes('this month')) ||
    (normalized.includes('spending') && normalized.includes('this month'))
  ) {
    const total = calculateMonthlyTotal(expenses, currentMonth, currentYear);
    return `You have spent exactly ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} so far this month.`;
  }

  // Intent: Highest spend category
  if (
    normalized.includes('where did i spend most') ||
    normalized.includes('top category') ||
    normalized.includes('highest spending') ||
    normalized.includes('most money') ||
    normalized.includes('biggest expense')
  ) {
    // Determine the highest category across ALL expenses
    const categoryMap = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    let topCat = '';
    let topVal = -1;

    for (const [cat, val] of Object.entries(categoryMap)) {
      if (val > topVal) {
        topVal = val;
        topCat = cat;
      }
    }

    return `Historically, your top spending category is ${topCat}. You've spent a total of ₹${topVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} on it.`;
  }

  // Intent: Total overall spend
  if (
    normalized.includes('total spend') ||
    normalized.includes('all time') ||
    normalized.includes('ever spent')
  ) {
    const overallTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    return `Across all logged data, your total recorded spending is ₹${overallTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`;
  }

  // Fallback
  return "I'm a simple bot! Try asking me: 'Where did I spend most?' or 'How much did I spend this month?'.";
};
