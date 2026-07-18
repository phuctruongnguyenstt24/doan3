// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import authRoutes from './src/routes/auth.js';
import portfolioRoutes from './src/routes/portfolio.js';
import blockchainRoutes from './src/routes/blockchain.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/profile_dapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Profile Schema
const profileSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  fullName: String,
  bio: String,
  email: String,
  phone: String,
  avatarHash: String,
  github: String,
  linkedin: String,
  website: String,
  updatedAt: { type: Date, default: Date.now }
});

const Profile = mongoose.model('Profile', profileSchema);

// Routes
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ updatedAt: -1 }).limit(20);
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profiles/:address', async (req, res) => {
  try {
    const profile = await Profile.findOne({ address: req.params.address.toLowerCase() });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profiles', async (req, res) => {
  try {
    const { address, ...data } = req.body;
    const profile = await Profile.findOneAndUpdate(
      { address: address.toLowerCase() },
      { ...data, address: address.toLowerCase(), updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/profiles/:address', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { address: req.params.address.toLowerCase() },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profiles/search', async (req, res) => {
  try {
    const { q } = req.query;
    const profiles = await Profile.find({
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    network: process.env.NETWORK || 'localhost'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});