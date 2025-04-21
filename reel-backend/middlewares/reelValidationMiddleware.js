const Reels = require('../models/Reels');

const validateReel = async (req, res, next) => {
    try {
        const reelId = req.params.id;
        
        // Check if reelId is a valid MongoDB ObjectId
        if (!reelId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid reel ID format' });
        }

        const reel = await Reels.findById(reelId);
        
        if (!reel) {
            return res.status(404).json({ error: 'Reel not found' });
        }

        // Check if reel is approved (for certain operations)
        if (req.method === 'GET' && reel.status !== 'approved') {
            return res.status(403).json({ error: 'This reel is not approved for viewing' });
        }

        // Attach the reel to the request for use in controllers
        req.reel = reel;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = validateReel; 