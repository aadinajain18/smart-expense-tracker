import express from 'express';
import { registerUser, loginUser, getMe, updateBudget } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/budget', protect, updateBudget);

export default router;
