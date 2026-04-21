import express from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// /api/expenses
router.route('/').get(protect, getExpenses).post(protect, createExpense);

// /api/expenses/:id
router.route('/:id').get(protect, getExpenseById).put(protect, updateExpense).delete(protect, deleteExpense);

export default router;
