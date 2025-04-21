const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  coverPhoto: { type: String },
  caption: { type: String },
  category: { type: String },
  trailerVideo: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },  // 👈 allows virtuals in JSON output
  toObject: { virtuals: true } // 👈 allows virtuals in object output
});

// 🪄 Virtual field to get all episodes of this reel
reelSchema.virtual('episodes', {
  ref: 'ReelEpisode',       // 👈 model to populate from
  localField: '_id',        // 👈 field in Reel
  foreignField: 'reelId',   // 👈 field in ReelEpisode
});

module.exports = mongoose.model('Reel', reelSchema);
