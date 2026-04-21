/**
 * Helper to filter expenses by month and year.
 * @param {Array} expenses - List of expense objects
 * @param {number} month - 0-indexed month (0 = Jan, 11 = Dec)
 * @param {number} year - Full year (e.g., 2026)
 * @returns {Array} Filtered expenses
 */
export const getExpensesForMonth = (expenses, month, year) => {
  return expenses.filter(expense => {
    const d = new Date(expense.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
};

/**
 * Calculate the total spending for a given month and year.
 * @param {Array} expenses - List of expense objects
 * @param {number} month - 0-indexed month
 * @param {number} year - Full year
 * @returns {number} Total spending
 */
export const calculateMonthlyTotal = (expenses, month, year) => {
  const monthlyExpenses = getExpensesForMonth(expenses, month, year);
  return monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
};

/**
 * Compare total spending of the current month versus the previous month.
 * @param {Array} expenses - List of expense objects
 * @param {number} currentMonth - 0-indexed current month
 * @param {number} currentYear - Current year
 * @returns {Object} Object containing totals, difference, and percentage change.
 */
export const compareMonths = (expenses, currentMonth, currentYear) => {
  const currentTotal = calculateMonthlyTotal(expenses, currentMonth, currentYear);
  
  // Handle year wrap around (January -> December of previous year)
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const prevTotal = calculateMonthlyTotal(expenses, prevMonth, prevYear);
  
  const difference = currentTotal - prevTotal;
  let percentageChange = 0;
  
  if (prevTotal > 0) {
    percentageChange = (difference / prevTotal) * 100;
  } else if (currentTotal > 0) {
    percentageChange = 100; // Spent money this month, but none last month
  }
  
  return {
    currentTotal,
    prevTotal,
    difference,
    percentageChange: Math.round(percentageChange)
  };
};

/**
 * Calculate the percentage increase/decrease per category between current and previous month.
 * @param {Array} expenses - List of expense objects
 * @param {number} currentMonth - 0-indexed current month
 * @param {number} currentYear - Current year
 * @returns {Array} Array of insight strings
 */
export const calculateCategoryTrends = (expenses, currentMonth, currentYear) => {
  const currentExpenses = getExpensesForMonth(expenses, currentMonth, currentYear);
  
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevExpenses = getExpensesForMonth(expenses, prevMonth, prevYear);
  
  // Group by category for both months
  const currentByCategory = currentExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});
  
  const prevByCategory = prevExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});
  
  const insights = [];
  
  // Compare categories that exist in the current month
  for (const category in currentByCategory) {
    const currentVal = currentByCategory[category];
    const prevVal = prevByCategory[category] || 0;
    
    if (prevVal > 0) {
      const percentage = Math.round(((currentVal - prevVal) / prevVal) * 100);
      
      if (percentage > 0) {
        insights.push(`You spent ${percentage}% more on ${category} this month compared to last month.`);
      } else if (percentage < 0) {
        insights.push(`Great job! You spent ${Math.abs(percentage)}% less on ${category} this month compared to last month.`);
      } else {
        insights.push(`Your spending on ${category} is exactly the same as last month.`);
      }
    } else {
      insights.push(`You spent ₹${currentVal.toFixed(2)} on ${category} this month (new category).`);
    }
  }
  
  return insights;
};

/**
 * Generate 3-5 human-readable insights for an array of expenses.
 * @param {Array} expenses - List of all user expenses
 * @returns {Array} Array of insight strings
 */
export const generateInsightsArray = (expenses) => {
  if (!expenses || expenses.length === 0) {
    return ["You haven't logged any expenses yet. Start adding expenses to get insights!"];
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const insights = [];

  // 1. Overall Trend
  const { currentTotal, prevTotal, percentageChange } = compareMonths(expenses, currentMonth, currentYear);
  if (prevTotal > 0) {
    if (percentageChange > 0) {
      insights.push(`Your overall spending is up by ${percentageChange}% this month compared to last month.`);
    } else if (percentageChange < 0) {
      insights.push(`Nice! Your overall spending decreased by ${Math.abs(percentageChange)}% this month.`);
    } else {
      insights.push(`Your overall spending is identical to last month.`);
    }
  } else {
    insights.push(`You've spent ₹${currentTotal.toFixed(2)} so far this month.`);
  }

  // 2. Highest category this month
  const currentExpenses = getExpensesForMonth(expenses, currentMonth, currentYear);
  if (currentExpenses.length > 0) {
    const categoryTotals = currentExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    
    let highestCat = '';
    let highestAmount = -1;
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > highestAmount) {
        highestAmount = amt;
        highestCat = cat;
      }
    }
    insights.push(`Your highest spending category this month is ${highestCat} at ₹${highestAmount.toFixed(2)}.`);
  }

  // 3. Category Trends
  const categoryTrends = calculateCategoryTrends(expenses, currentMonth, currentYear);
  // Pick up to 3 interesting category trends (e.g. anything but "identical")
  const interestingTrends = categoryTrends.filter(t => !t.includes('exactly the same') && !t.includes('new category'));
  
  insights.push(...interestingTrends.slice(0, 3));

  // If we still need more insights and there were new categories
  if (insights.length < 3) {
    const newCatTrends = categoryTrends.filter(t => t.includes('new category'));
    insights.push(...newCatTrends.slice(0, 3 - insights.length));
  }

  // 4. Smart Savings Tips
  const discretionaryCategories = ['Food & Dining', 'Entertainment', 'Shopping', 'Travel'];
  if (currentExpenses.length > 0) {
    let topDiscretionaryCat = '';
    let topDiscretionaryAmt = -1;
    
    // categoryTotals was already computed in step 2. Let's recalculate or pull.
    const categoryTotals = currentExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (discretionaryCategories.includes(cat) && amt > topDiscretionaryAmt) {
        topDiscretionaryAmt = amt;
        topDiscretionaryCat = cat;
      }
    }

    if (topDiscretionaryAmt > 0) {
      // Suggest saving 20%
      const potentialSavings = (topDiscretionaryAmt * 0.2).toFixed(2);
      insights.push(`💡 Tip: You can save ₹${potentialSavings} by reducing your ${topDiscretionaryCat.toLowerCase()} expenses by 20%.`);
    } else {
      // If no discretionary, suggest a general 10% cut
      const potentialSavings = (currentTotal * 0.1).toFixed(2);
      insights.push(`💡 Tip: Small cuts add up! You could save ₹${potentialSavings} by reducing your overall spending by 10%.`);
    }
  }

  return insights;
};
