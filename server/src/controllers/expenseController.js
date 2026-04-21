import Expense from '../models/Expense.js';

// @desc    Get all expenses (sorted newest first)
// @route   GET /api/expenses
export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });

    res.json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single expense by ID
// @route   GET /api/expenses/:id
export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
export const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date } = req.body;

    const expense = await Expense.create({
      user: req.user.id,
      title,
      amount,
      category,
      date: date || Date.now(),
    });

    if (req.io) {
      req.io.emit('expense_updated', req.user.id);
    }

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    // Mongoose validation errors → 400
    if (error.name === 'ValidationError') {
      res.status(400);
      const messages = Object.values(error.errors).map((e) => e.message);
      error.message = messages.join(', ');
    }
    next(error);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    // Check for user
    if (expense.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (req.io) {
      req.io.emit('expense_updated', req.user.id);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400);
      const messages = Object.values(error.errors).map((e) => e.message);
      error.message = messages.join(', ');
    }
    next(error);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    // Check for user
    if (expense.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await Expense.findByIdAndDelete(req.params.id);

    if (req.io) {
      req.io.emit('expense_updated', req.user.id);
    }

    res.json({ success: true, data: {}, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};
