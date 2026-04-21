import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import StatsBar from '../components/StatsBar';
import MiniTimeInsights from '../components/MiniTimeInsights';
import CategoryPieChart from '../components/CategoryPieChart';
import MonthlyBarChart from '../components/MonthlyBarChart';
import AddExpenseForm from '../components/AddExpenseForm';
import ExpenseList from '../components/ExpenseList';
import InsightsPanel from '../components/InsightsPanel';
import Toast from '../components/Toast';
import Chatbot from '../components/Chatbot';
import { expenseAPI } from '../services/api';

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();

  // --- Fetch all expenses ---
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await expenseAPI.getAll();
      setExpenses(data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        // Handled by ProtectedRoute mostly, but handle just in case
        setError('Unauthorized. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load expenses');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();

    // Socket.io real-time connection
    // In dev, connects through Vite proxy. In prod, connects directly to Render backend.
    const SOCKET_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(SOCKET_URL, { path: '/socket.io', withCredentials: true });
    
    socket.on('connect', () => {
      console.log('🔗 Connected to realtime service');
    });

    socket.on('expense_updated', (updatedUserId) => {
      // If the broadcast targets the logged in user, refresh their data
      if (updatedUserId === user?.id || updatedUserId === user?._id) {
        console.log('🔄 Remote update detected. Refreshing expenses...');
        fetchExpenses();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchExpenses, user]);

  // --- Add expense (Optimistic Update) ---
  const handleAdd = async (expenseData) => {
    // Generate a temporary ID for the optimistic update
    const tempId = `temp_${Date.now()}`;
    const optimisticExpense = {
      _id: tempId,
      ...expenseData,
      date: expenseData.date || new Date().toISOString(),
      // Add fake parsed amount just in case parsing matters
      amount: Number(expenseData.amount),
    };

    // Optimistically update UI
    setExpenses((prev) => [optimisticExpense, ...prev]);

    try {
      // Sync with server
      const { data } = await expenseAPI.create(expenseData);
      
      // Replace the optimistic entry with the verified backend entry
      setExpenses((prev) => 
        prev.map(exp => exp._id === tempId ? data.data : exp)
      );
      
      showToast('Expense added successfully', 'success');
      return true;
    } catch (err) {
      // Rollback on failure
      console.warn('Optimistic update failed, rolling back...');
      setExpenses((prev) => prev.filter((exp) => exp._id !== tempId));
      showToast(err.response?.data?.message || 'Failed to add expense', 'error');
      return false;
    }
  };

  // --- Delete expense ---
  const handleDelete = async (id) => {
    const prev = expenses;
    setExpenses((current) => current.filter((e) => e._id !== id));

    try {
      await expenseAPI.delete(id);
      showToast('Expense deleted', 'success');
    } catch (err) {
      setExpenses(prev);
      showToast(err.response?.data?.message || 'Failed to delete expense', 'error');
    }
  };

  // --- Toast helper ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-page font-sans text-secondary">
      {/* Subtle gradient glow behind content */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-accent-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-16">
        <Header />

        {/* Mini Daily/Weekly Pulse */}
        <section className="mt-6 mb-4">
          <MiniTimeInsights expenses={expenses} loading={loading} />
        </section>

        {/* Stats */}
        <section className="mb-6 lg:mb-8">
          <StatsBar expenses={expenses} loading={loading} />
        </section>

        {/* Charts row — pie + bar side by side */}
        {loading ? (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="card h-[380px] rounded-2xl animate-pulse flex flex-col p-6">
              <div className="h-5 w-40 bg-surface-hover rounded-lg mb-8" />
              <div className="flex-1 rounded-full bg-surface-hover mx-auto aspect-square" style={{ maxHeight: '200px' }} />
            </div>
            <div className="card h-[380px] rounded-2xl animate-pulse flex flex-col p-6">
              <div className="h-5 w-48 bg-surface-hover rounded-lg mb-8" />
              <div className="flex-1 flex items-end gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex-1 bg-surface-hover rounded-t-sm" style={{ height: `${Math.random() * 60 + 20}%` }} />
                ))}
              </div>
            </div>
          </section>
        ) : expenses.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <CategoryPieChart expenses={expenses} />
            <MonthlyBarChart expenses={expenses} />
          </section>
        )}

        {/* Main grid — form + insights on left, list on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-6 space-y-6">
              <AddExpenseForm onAdd={handleAdd} />
              <InsightsPanel expenses={expenses} />
            </div>
          </aside>

          <main className="lg:col-span-8">
            <ExpenseList
              expenses={expenses}
              onDelete={handleDelete}
              loading={loading}
              error={error}
              onRetry={fetchExpenses}
            />
          </main>
        </div>
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Floating Chatbot Widget */}
      <Chatbot />
    </div>
  );
}

export default Dashboard;
