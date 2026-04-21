/**
 * Parses a natural language voice string to extract expense components.
 * Example: "I spent 500 on food today" -> { amount: 500, category: 'Food & Dining', date: 'today' }
 * 
 * @param {string} text - The transcribed voice input
 * @returns {Object} Extracted data: { amount, category, date }
 */
export const parseVoiceInput = (text) => {
  const normalized = text.toLowerCase();
  
  // 1. Extract Amount (Looks for raw numbers potentially prefixed/suffixed with currency words)
  const amountMatch = normalized.match(/(?:spent|paid|cost)?\s*(?:rs|rupees|inr|₹|\$)?\s*(\d+(?:\.\d+)?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

  // 2. Extract Date
  let date = 'today';
  if (normalized.includes('yesterday')) {
    date = 'yesterday';
  } else if (normalized.includes('last week')) {
    date = 'last week';
  }

  // 3. Extract Category via fuzzy Keyword Mapping
  let category = null;
  const categoryKeywords = {
    'Food & Dining': ['food', 'lunch', 'dinner', 'breakfast', 'restaurant', 'meal', 'cafe', 'coffee', 'dining', 'swiggy', 'zomato', 'grocery'],
    'Transportation': ['uber', 'taxi', 'cab', 'bus', 'train', 'metro', 'flight', 'transport', 'fuel', 'petrol', 'gas'],
    'Entertainment': ['movie', 'cinema', 'game', 'concert', 'netflix', 'entertainment', 'spotify', 'party'],
    'Shopping': ['shop', 'clothes', 'shoes', 'amazon', 'flipkart', 'buy', 'purchased'],
    'Bills & Utilities': ['bill', 'electricity', 'water', 'internet', 'wifi', 'rent', 'recharge'],
    'Health & Fitness': ['doctor', 'hospital', 'medicine', 'gym', 'health', 'fitness', 'pharmacy'],
    'Travel': ['hotel', 'stay', 'trip', 'travel', 'holiday']
  };

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => normalized.includes(kw))) {
      category = cat;
      break;
    }
  }

  return { 
    amount, 
    category: category || 'Other', // Fallback
    date 
  };
};
