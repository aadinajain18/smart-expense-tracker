import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import expenseRoutes from './routes/expenseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);
const frontendOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173'
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? frontendOrigins : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});

const PORT = process.env.PORT || 5000;

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Pass io to all requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? frontendOrigins : '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/chat', chatRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  
  // Keep-alive ping for Render free tier to prevent cold starts
  // Render automatically sets RENDER_EXTERNAL_URL
  if (process.env.RENDER_EXTERNAL_URL) {
    setInterval(() => {
      fetch(`${process.env.RENDER_EXTERNAL_URL}/api/health`)
        .then(res => console.log(`[Keep-alive] Ping successful - Status: ${res.status}`))
        .catch(err => console.error(`[Keep-alive] Ping failed:`, err.message));
    }, 1000 * 60 * 14); // Ping every 14 minutes (Render sleeps after 15m)
  }
});

export default app;
