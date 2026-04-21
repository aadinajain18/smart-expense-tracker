// ─────────────────────────────────────────────
// Smart Features — Pure utility functions
// ─────────────────────────────────────────────

import { getCategoryMeta, formatCurrency } from '../data/mockData';

// ══════════════════════════════════════════════
// 1. AUTO-CATEGORIZATION
// Keyword-based category suggestion from title
// ══════════════════════════════════════════════

const KEYWORD_MAP = {
  'Food & Dining': [
    'food', 'lunch', 'dinner', 'breakfast', 'snack', 'coffee', 'tea', 'cafe',
    'restaurant', 'pizza', 'burger', 'biryani', 'swiggy', 'zomato', 'grocery',
    'groceries', 'bigbasket', 'blinkit', 'zepto', 'milk', 'bread', 'fruit',
    'vegetables', 'meat', 'chicken', 'fish', 'rice', 'dal', 'curry', 'noodles',
    'pasta', 'sandwich', 'juice', 'smoothie', 'bakery', 'cake', 'ice cream',
    'chocolate', 'chips', 'cook', 'kitchen', 'meal', 'eat', 'dine',
  ],
  'Transportation': [
    'uber', 'ola', 'cab', 'taxi', 'auto', 'rickshaw', 'bus', 'metro',
    'train', 'fuel', 'petrol', 'diesel', 'gas', 'parking', 'toll',
    'commute', 'ride', 'drive', 'transport', 'rapido', 'bike',
  ],
  'Shopping': [
    'shopping', 'amazon', 'flipkart', 'myntra', 'ajio', 'clothes', 'shoes',
    'shirt', 'jeans', 'dress', 'jacket', 'watch', 'bag', 'accessories',
    'electronics', 'gadget', 'phone', 'laptop', 'headphone', 'earphone',
    'furniture', 'decor', 'appliance', 'buy', 'purchase', 'order',
  ],
  'Entertainment': [
    'movie', 'film', 'cinema', 'netflix', 'prime', 'hotstar', 'disney',
    'spotify', 'music', 'concert', 'show', 'game', 'gaming', 'playstation',
    'xbox', 'steam', 'subscription', 'youtube', 'premium', 'party',
    'event', 'ticket', 'amusement', 'fun', 'outing',
  ],
  'Bills & Utilities': [
    'bill', 'electricity', 'electric', 'water', 'gas', 'wifi', 'internet',
    'broadband', 'phone bill', 'mobile recharge', 'recharge', 'rent',
    'maintenance', 'insurance', 'emi', 'loan', 'tax', 'utility',
  ],
  'Health & Fitness': [
    'gym', 'fitness', 'workout', 'yoga', 'medicine', 'medical', 'doctor',
    'hospital', 'clinic', 'pharmacy', 'health', 'dental', 'eye', 'checkup',
    'supplement', 'protein', 'vitamin', 'therapy', 'physiotherapy',
  ],
  'Travel': [
    'travel', 'trip', 'flight', 'hotel', 'hostel', 'airbnb', 'booking',
    'resort', 'vacation', 'holiday', 'tour', 'visa', 'passport',
    'luggage', 'suitcase', 'airport', 'railway', 'makemytrip', 'goibibo',
  ],
  'Education': [
    'course', 'class', 'tuition', 'book', 'textbook', 'udemy', 'coursera',
    'school', 'college', 'university', 'exam', 'test', 'certification',
    'tutorial', 'workshop', 'seminar', 'stationery', 'notebook', 'pen',
    'study', 'learn', 'education',
  ],
  'Personal Care': [
    'salon', 'haircut', 'spa', 'massage', 'skincare', 'cosmetic', 'makeup',
    'perfume', 'grooming', 'shampoo', 'soap', 'lotion', 'cream', 'facial',
    'manicure', 'pedicure', 'parlour', 'parlor', 'beauty',
  ],
};

/**
 * Suggest a category based on the expense title.
 * Returns { category, confidence } or null if no match.
 */
export function suggestCategory(title) {
  if (!title || title.trim().length < 2) return null;

  const words = title.toLowerCase().split(/\s+/);
  const titleLower = title.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    let score = 0;

    for (const keyword of keywords) {
      // Exact word match = 2 points, substring match = 1 point
      if (words.includes(keyword)) {
        score += 2;
      } else if (titleLower.includes(keyword)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  if (bestScore === 0) return null;

  // Confidence: low (1), medium (2–3), high (4+)
  const confidence = bestScore >= 4 ? 'high' : bestScore >= 2 ? 'medium' : 'low';

  return { category: bestMatch, confidence };
}


// ══════════════════════════════════════════════
// 2. MONTHLY SUMMARY
// Group expenses by month, compute totals
// ══════════════════════════════════════════════

/**
 * Returns an array of monthly summaries, sorted newest first.
 * Each item: { key, label, total, count }
 */
export function getMonthlySummary(expenses) {
  const map = {};

  for (const exp of expenses) {
    const d = new Date(exp.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    if (!map[key]) {
      map[key] = { key, label, total: 0, count: 0 };
    }
    map[key].total += exp.amount;
    map[key].count += 1;
  }

  return Object.values(map).sort((a, b) => b.key.localeCompare(a.key));
}


// ══════════════════════════════════════════════
// 3. CATEGORY BREAKDOWN
// Group expenses by category, compute totals & %
// ══════════════════════════════════════════════

/**
 * Returns an array of category breakdowns, sorted by total descending.
 * Each item: { category, icon, color, total, count, percentage, formattedTotal }
 */
export function getCategoryBreakdown(expenses) {
  if (expenses.length === 0) return [];

  const map = {};
  let grandTotal = 0;

  for (const exp of expenses) {
    const cat = exp.category || 'Other';
    if (!map[cat]) {
      map[cat] = { category: cat, total: 0, count: 0 };
    }
    map[cat].total += exp.amount;
    map[cat].count += 1;
    grandTotal += exp.amount;
  }

  return Object.values(map)
    .map((item) => {
      const meta = getCategoryMeta(item.category);
      return {
        ...item,
        icon: meta.icon,
        color: meta.color,
        percentage: grandTotal > 0 ? Math.round((item.total / grandTotal) * 100) : 0,
        formattedTotal: formatCurrency(item.total),
      };
    })
    .sort((a, b) => b.total - a.total);
}

// ══════════════════════════════════════════════
// 4. SMART INSIGHTS
// Compare month-over-month spending per category
// ══════════════════════════════════════════════

export function generateInsights(expenses) {
  if (expenses.length === 0) return [];

  // Group by "YYYY-MM" -> "Category" -> total
  const monthMap = {};

  for (const exp of expenses) {
    const d = new Date(exp.date);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const cat = exp.category || 'Other';

    if (!monthMap[mKey]) monthMap[mKey] = {};
    if (!monthMap[mKey][cat]) monthMap[mKey][cat] = 0;
    
    monthMap[mKey][cat] += exp.amount;
  }

  const sortedMonths = Object.keys(monthMap).sort((a, b) => b.localeCompare(a));
  
  if (sortedMonths.length < 2) {
    return [
      { text: "Keep logging expenses to unlock intelligent month-over-month insights.", type: "info" }
    ];
  }

  const currentMonth = sortedMonths[0]; // e.g., "2026-04"
  const previousMonth = sortedMonths[1]; // e.g., "2026-03"

  const insights = [];

  // Compare categories
  for (const cat of Object.keys(monthMap[currentMonth] || {})) {
    const currentTotal = monthMap[currentMonth][cat] || 0;
    const previousTotal = monthMap[previousMonth]?.[cat] || 0;

    if (previousTotal > 0) {
      const diff = currentTotal - previousTotal;
      const percentChange = Math.round((Math.abs(diff) / previousTotal) * 100);

      if (diff > 0 && percentChange >= 20) {
        insights.push({
          text: `You spent ${percentChange}% more on ${cat} this month compared to last month. Consider setting a budget!`,
          type: 'warning'
        });
      } else if (diff < 0 && percentChange >= 20) {
        insights.push({
          text: `Great job! You spent ${percentChange}% less on ${cat} this month than last month.`,
          type: 'success'
        });
      }
    }
  }

  if (insights.length === 0) {
    insights.push({ text: "Your spending habits are very stable compared to last month.", type: "info" });
  }

  return insights;
}
