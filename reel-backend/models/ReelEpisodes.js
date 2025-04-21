const mongoose = require('mongoose');

const reelEpisodeSchema = new mongoose.Schema({
  episodeNumber: { type: Number, required: true,unique: true },
  episodeName: { type: String, required: true },
  description: { type: String, required: true },
  caption: { type: String },
  videoUrl: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  },
  reelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel' }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReelEpisodes', reelEpisodeSchema);
