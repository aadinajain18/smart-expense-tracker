import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // wait for exit animation
    }, 2700);

    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'from-accent-600 to-accent-500 shadow-accent-500/25',
    error: 'from-rose-600 to-rose-500 shadow-rose-500/25',
  };

  const icons = {
    success: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto w-max z-50 animate-fade-in pointer-events-none">
      <div 
        className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-lg border backdrop-blur-md bg-surface max-w-[90vw] text-sm ${
          type === 'success' 
            ? 'border-accent-500/30 text-accent-400' 
            : 'border-rose-500/30 text-rose-400'
        }`}
      >
      {icons[type]}
      {message}
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="ml-1 p-0.5 rounded hover:bg-white/15 cursor-pointer pointer-events-auto">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      </div>
    </div>
  );
}
