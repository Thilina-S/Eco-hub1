import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js'; // Optional, include if available
import productRoutes from './routes/productRoutes.js'; // Added from second block

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parsing JSON

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes); // Only if you have this file
app.use('/api/products', productRoutes); // Added products route

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
