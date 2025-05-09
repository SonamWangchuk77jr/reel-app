const mongoose = require('mongoose');

const adsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    point: {
        type: Number,
        required: true
    },
    adsVideoUrl: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ads', adsSchema);