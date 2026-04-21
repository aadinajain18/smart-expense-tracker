import { useState, useRef, useEffect } from 'react';
import { authAPI } from '../services/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi! I am your AI assistant. You can ask me things like "Where did I spend most?" or "How much did I spend this month?".' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Speech Recognition instance
  const recognition = useRef(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListen = () => {
    if (!recognition.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userInput = input.trim();
    // Add user message
    const newMessage = { id: Date.now(), sender: 'user', text: userInput };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await authAPI.chat(userInput);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'bot', text: data.reply }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'bot', text: 'Error connecting to the server. Please try again later.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-50 ${
          isOpen
            ? 'bg-surface border border-divider text-primary rotate-90 scale-95'
            : 'bg-gradient-to-tr from-accent-500 to-cyan-500 text-white hover:scale-105 hover:shadow-cyan-500/20'
        }`}
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-4 lg:bottom-28 lg:right-10 w-[calc(100vw-32px)] sm:w-[380px] h-[500px] max-h-[calc(100vh-120px)] card shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right z-40 ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 pointer-events-none translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-divider bg-surface flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-500 to-cyan-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Smart Assistant</h3>
            <p className="text-[11px] text-emerald-500 font-medium">Online</p>
          </div>
        </div>

        {/* Messages Layout */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-page/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-br from-accent-500 to-cyan-500 text-white rounded-br-sm shadow-md'
                      : 'bg-surface border border-divider text-primary rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-surface border border-divider rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-tertiary animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-tertiary animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-tertiary animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 bg-surface border-t border-divider">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask me anything..."}
              className={`flex-1 bg-input border ${isListening ? 'border-accent-500 ring-1 ring-accent-500/20' : 'border-divider'} rounded-full pl-5 pr-20 py-2.5 text-[13px] text-primary focus:border-accent-500 transition-colors focus:ring-1 focus:ring-accent-500/20`}
            />
            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleListen}
              className={`absolute right-12 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                isListening ? 'text-rose-500 bg-rose-500/10' : 'text-tertiary hover:text-primary hover:bg-surface-hover'
              }`}
              aria-label="Toggle voice input"
            >
              {isListening ? (
                <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-accent-500 hover:bg-accent-400 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
