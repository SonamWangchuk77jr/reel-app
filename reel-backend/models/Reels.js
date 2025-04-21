const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  video: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  },
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

// Virtual field to get like count
reelSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual field to get save count
reelSchema.virtual('saveCount').get(function() {
  return this.saves.length;
});

module.exports = mongoose.model('Reel', reelSchema);
