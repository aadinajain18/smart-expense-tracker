import Expense from '../models/Expense.js';
import { processChatQuery } from '../utils/chatbot.js';
import { generateInsightsArray } from '../utils/analytics.js';

// Helper to pass the query securely to OpenAI for generation
const generateAILanguageResponse = async (query, expenses) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') return null;

  // Generate the raw financial stats exactly like the dashboard to feed the bot
  const rawFacts = generateInsightsArray(expenses);

  const prompt = `
You are an expert, friendly personal finance assistant helping a user track their expenses.
The user asked you: "${query}"

Here are their current true financial statistics:
${rawFacts.map((fact) => `- ${fact}`).join('\n')}

Answer the user's question directly and conversationally using their exact numerical data. 
If they ask something unrelated to finance or their data, politely refuse and steer them back to their expenses.
Keep your response extremely short, punchy, and helpful (under 3 sentences). Do not use markdown.
  `;

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
      console.warn('OpenAI Chat Completion failed');
      return null;
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.warn('OpenAI backend error:', error.message);
    return null;
  }
};

// @desc    Process a user's natural language chatbot query
// @route   POST /api/chat
// @access  Private
export const handleChatQuery = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'A valid text message is required.' 
      });
    }

    const expenses = await Expense.find({ user: req.user.id });

    // 1. Attempt AI Processing natively
    const aiResponse = await generateAILanguageResponse(message, expenses);

    // 2. Serve AI string if resolved, otherwise strictly fallback to local offline parser logic
    const reply = aiResponse || processChatQuery(message, expenses);

    res.json({
      success: true,
      reply
    });

  } catch (error) {
    next(error);
  }
};
