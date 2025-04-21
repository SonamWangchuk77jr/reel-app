const mongoose = require('mongoose');

const reelEpisodeSchema = new mongoose.Schema({
  episodeName: { type: String, required: true },
  description: { type: String, required: true },
  caption: { type: String },
  videoUrl: { type: String },
  likeCount: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  },
  reelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel' }, // 👈 reference to Reel
}, {
  timestamps: true
});

module.exports = mongoose.model('ReelEpisode', reelEpisodeSchema);
