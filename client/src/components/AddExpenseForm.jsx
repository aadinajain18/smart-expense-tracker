import { useState, useEffect } from 'react';
import { CATEGORIES } from '../data/mockData';
import { suggestCategory } from '../utils/smartFeatures';
import { parseVoiceInput } from '../utils/voiceParser';

export default function AddExpenseForm({ onAdd }) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [userPickedCategory, setUserPickedCategory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const parsed = parseVoiceInput(transcript);
      
      let newDate = new Date();
      if (parsed.date === 'yesterday') {
        newDate.setDate(newDate.getDate() - 1);
      } else if (parsed.date === 'last week') {
        newDate.setDate(newDate.getDate() - 7);
      }

      setForm((prev) => ({
        ...prev,
        title: transcript,
        amount: parsed.amount ? parsed.amount.toString() : prev.amount,
        category: parsed.category !== 'Other' ? parsed.category : prev.category,
        date: newDate.toISOString().split('T')[0],
      }));
      setUserPickedCategory(true);
      
      if (parsed.category !== 'Other') {
        setSuggestion({ category: parsed.category, confidence: 'high' });
      } else {
        setSuggestion(null);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      alert("Error occurred in recognition: " + event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Auto-suggest category when title changes
  useEffect(() => {
    if (userPickedCategory) return; // user overrode — don't auto-suggest

    const result = suggestCategory(form.title);
    if (result && result.confidence !== 'low') {
      setSuggestion(result);
      setForm((prev) => ({ ...prev, category: result.category }));
    } else {
      setSuggestion(null);
    }
  }, [form.title, userPickedCategory]);

  const handleChange = (e) => {
    if (e.target.name === 'category') {
      setUserPickedCategory(true);
      setSuggestion(null);
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTitleChange = (e) => {
    setUserPickedCategory(false); // re-enable auto-suggest when user edits title
    setForm({ ...form, title: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount || submitting) return;

    setSubmitting(true);
    const success = await onAdd({
      title: form.title.trim(),
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date,
    });
    setSubmitting(false);

    if (success) {
      if (voiceFeedback && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Expense added successfully');
        utterance.volume = 0.6; // subtle volume
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }

      setForm({
        title: '',
        amount: '',
        category: 'Food & Dining',
        date: new Date().toISOString().split('T')[0],
      });
      setSuggestion(null);
      setUserPickedCategory(false);
    }
  };

  const confidenceColors = {
    high: 'text-accent-400 bg-accent-500/10 border-accent-500/30',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  };

  return (
    <form onSubmit={handleSubmit} className="card rounded-2xl p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-accent-500/15 text-accent-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </span>
          Add Expense
        </h2>
        <button
          type="button"
          onClick={() => setVoiceFeedback(!voiceFeedback)}
          className={`p-1.5 rounded-lg transition-colors ${voiceFeedback ? 'text-accent-500 bg-accent-500/10' : 'text-tertiary hover:bg-input-hover'}`}
          title={voiceFeedback ? "Disable voice feedback" : "Enable voice feedback"}
        >
          {voiceFeedback ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.657 6.343a8 8 0 010 11.314M12 18.75l-4.5-4.5H4.5a1.5 1.5 0 01-1.5-1.5v-1.5a1.5 1.5 0 011.5-1.5h3l4.5-4.5v13.5z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="expense-title" className="block text-xs font-medium text-tertiary mb-1.5 uppercase tracking-wider">
            Title
          </label>
          <div className="relative">
            <input
              id="expense-title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleTitleChange}
              placeholder="e.g. Grocery shopping"
              required
              disabled={submitting}
              className="w-full pl-4 pr-12 py-2.5 min-h-[44px] bg-input border border-divider rounded-xl text-primary text-[16px] sm:text-sm placeholder:text-muted focus:border-accent-500 disabled:opacity-50 transition-colors"
            />
            <button
              type="button"
              onClick={startListening}
              disabled={isListening || submitting}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                isListening 
                  ? 'bg-red-500/20 text-red-500 animate-pulse' 
                  : 'text-tertiary hover:bg-input-hover hover:text-accent-500'
              }`}
              title="Add using voice"
            >
              {isListening ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="6" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          </div>
          {/* Auto-categorization badge */}
          {suggestion && (
            <div className={`mt-2 px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 ${confidenceColors[suggestion.confidence]}`}>
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              Auto-detected: <strong>{suggestion.category}</strong>
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="expense-amount" className="block text-xs font-medium text-tertiary mb-1.5 uppercase tracking-wider">
            Amount (₹)
          </label>
          <input
            id="expense-amount"
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="0.01"
            required
            disabled={submitting}
            className="w-full px-4 py-2.5 min-h-[44px] bg-input border border-divider rounded-xl text-primary text-[16px] sm:text-sm placeholder:text-muted focus:border-accent-500 disabled:opacity-50"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="expense-category" className="block text-xs font-medium text-tertiary mb-1.5 uppercase tracking-wider">
            Category
          </label>
          <select
            id="expense-category"
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={submitting}
            className="w-full px-4 py-2.5 min-h-[44px] bg-input border border-divider rounded-xl text-primary text-[16px] sm:text-sm focus:border-accent-500 appearance-none cursor-pointer disabled:opacity-50"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon}  {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="expense-date" className="block text-xs font-medium text-tertiary mb-1.5 uppercase tracking-wider">
            Date
          </label>
          <input
            id="expense-date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            disabled={submitting}
            className="w-full px-4 py-2.5 min-h-[44px] bg-input border border-divider rounded-xl text-primary text-[16px] sm:text-sm focus:border-accent-500 disabled:opacity-50"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 mt-2 min-h-[48px] bg-gradient-to-r from-accent-500 to-cyan-500 hover:from-accent-400 hover:to-cyan-400 text-white font-semibold text-[15px] rounded-full shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 transition-all"
        >
          {submitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Adding...
            </>
          ) : (
            'Add Expense'
          )}
        </button>
      </div>
    </form>
  );
}
