import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User';
import Score from './models/Score';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pokemon_type';
mongoose.connect(MONGODB_URI)
  .then(() => console.log(`Connected to MongoDB: ${MONGODB_URI.includes('srv') ? 'Atlas' : 'Local'}`))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({ username, password: hashedPassword });
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET);
    res.status(201).json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET);
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Score Routes
app.post('/api/scores', authenticateToken, async (req: any, res) => {
  try {
    const { gameType, mode, gen, streak } = req.body;
    const { userId, username } = req.user;

    const score = new Score({
      userId,
      username,
      gameType,
      mode,
      gen,
      streak
    });

    await score.save();
    res.status(201).json(score);
  } catch (err) {
    res.status(500).json({ message: 'Error saving score' });
  }
});

// Leaderboard Route
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { gen } = req.query;
    if (!gen) return res.status(400).json({ message: 'Generation required' });

    // Fetch top 10 scores for each category/mode for the specific gen
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
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
