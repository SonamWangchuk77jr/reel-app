const mongoose = require('mongoose');

const reelEpisodeSchema = new mongoose.Schema({
  episodeNumber: { type: Number, required: true },
  episodeName: { type: String, required: true },
  description: { type: String, required: true },
  caption: { type: String },
  videoUrl: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  },
  reelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', required: true }
}, {
  timestamps: true
});

// Define compound index for unique episodeNumber per reelId
reelEpisodeSchema.index({ reelId: 1, episodeNumber: 1 }, { unique: true });

module.exports = mongoose.model('ReelEpisodes', reelEpisodeSchema);
