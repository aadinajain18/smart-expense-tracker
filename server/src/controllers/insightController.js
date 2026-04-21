import Expense from '../models/Expense.js';
import { generateInsightsArray } from '../utils/analytics.js';

// Helper to call OpenAI API
const enhanceInsightsWithAI = async (ruleBasedInsights) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') return null; // Fallback to rules if no key

  const prompt = `
You are a helpful personal finance assistant. Here are some raw facts about user spending:
${ruleBasedInsights.map(i => '- ' + i).join('\n')}

Rewrite these facts into exactly 3-5 short, friendly, and non-technical natural language insights. 
Keep them concise and encouraging.
Return ONLY a valid JSON array of strings. Do not include markdown formatting or blocks. 
Example Output:
["You spent 20% more on Food this month.", "Awesome work cutting back on Shopping!"]`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.warn('OpenAI API responded with non-200 status');
      return null;
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Sometimes the model returns markdown code blocks ```json [...] ```
    if (content.startsWith('```json')) {
      content = content.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (content.startsWith('```')) {
      content = content.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed; // Successfully enhanced
    }
  } catch (error) {
    console.warn('AI enhancement failed, falling back to rules:', error.message);
  }
  return null;
};

// @desc    Get smart insights based on user expenses
// @route   GET /api/insights
// @access  Private
export const getInsights = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id });
    
    // 1. Generate base rule-based analytics
    const baseInsights = generateInsightsArray(expenses);
    
    // 2. Attempt AI enhancements natively
    const aiInsights = await enhanceInsightsWithAI(baseInsights);
    
    // 3. Serve AI insights if parsed correctly, otherwise fallback
    res.json(aiInsights || baseInsights);
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ message: 'Server error generating insights' });
  }
};
