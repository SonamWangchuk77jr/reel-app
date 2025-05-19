const mongoose = require('mongoose');

const forgotPasswordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    confirmationCode: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, expires: '1m' }
});

module.exports = mongoose.model('ForgotPassword', forgotPasswordSchema);