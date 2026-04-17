import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  gameType: {
    type: String,
    required: true,
    enum: ['type-quiz', 'move-mastery', 'ability-desc', 'pokemon-ability'],
  },
  mode: {
    type: String,
    required: true,
  },
  gen: {
    type: Number,
    required: true,
  },
  streak: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Score', scoreSchema);
