import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from './models/User';
import Score from './models/Score';

// Load environment variables for local testing
dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: JWT_SECRET is not defined. Using fallback for non-production only.');
}

app.use(cors());
app.use(express.json());

// MongoDB Connection Logic for Serverless
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables. Please check your Vercel/Local config.');
  }
  
  try {
    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error details:', err);
    throw err;
  }
};

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'fallback_secret_only_for_dev';
};

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  const secret = getJwtSecret();
  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    const secret = getJwtSecret();
    const token = jwt.sign({ userId: user._id, username: user.username }, secret);
    res.status(201).json({ token, username: user.username });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, (user as any).password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const secret = getJwtSecret();
    const token = jwt.sign({ userId: user._id, username: user.username }, secret);
    res.json({ token, username: user.username });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error during login' });
  }
});

// Score Routes
app.post('/api/scores', authenticateToken, async (req: any, res) => {
  try {
    await connectDB();
    const { gameType, mode, gen, streak } = req.body;
    const { userId, username } = req.user;

    const score = new Score({ userId, username, gameType, mode, gen, streak });
    await score.save();
    res.status(201).json(score);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error saving score' });
  }
});

// Leaderboard Route
app.get('/api/leaderboard', async (req, res) => {
  try {
    await connectDB();
    const { gen } = req.query;
    const scores = await Score.aggregate([
      { $match: { gen: Number(gen) } },
      { $sort: { streak: -1 } },
      {
        $group: {
          _id: { gameType: '$gameType', mode: '$mode' },
          topScores: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 1,
          topScores: { $slice: ['$topScores', 10] }
        }
      }
    ]);
    res.json(scores);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching leaderboard' });
  }
});

// For local testing
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server on ${PORT}`));
}

export default app;
