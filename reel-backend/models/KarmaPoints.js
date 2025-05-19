const mongoose = require('mongoose');

const karmaPointsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    points: {
        type: Number,
        default: 0,
    },
    dailyPoints: { type: Boolean, default: false },
    lastDailyPointsDate: { type: Date, default: null },
    currentStreakDay: { type: Number, default: 1 },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('KarmaPoints', karmaPointsSchema);