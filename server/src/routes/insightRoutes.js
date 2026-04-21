import express from 'express';
import { getInsights } from '../controllers/insightController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getInsights);

export default router;
