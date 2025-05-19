const KarmaPoints = require('../models/KarmaPoints');

// Add or Update karma points for a user
exports.addKarmaPoints = async (req, res) => {
    const { points } = req.body;
    try {

        // Get user ID from the authenticated request
        const userId = req.user.id;

        // Find if the user already has a KarmaPoints document
        let karmaPoints = await KarmaPoints.findOne({ userId });
        if (karmaPoints) {
            // Update existing points
            karmaPoints.points += points;
            await karmaPoints.save();
        } else {
            // Create new KarmaPoints document
            karmaPoints = new KarmaPoints({ userId, points });
            await karmaPoints.save();
        }
        

        res.status(201).json({ message: 'Karma points added/updated successfully', karmaPoints });
    } catch (error) {
        console.error('Error adding karma points:', error);
        res.status(500).json({ message: 'Failed to add karma points' });
    }
};

// Get karma points for a user
exports.getKarmaPoints = async (req, res) => {
    const userId = req.user.id;

    try {
        // Check if the user exists
        const karmaPoints = await KarmaPoints.findOne({ userId });
        if (!karmaPoints) {
            return res.status(404).json({ message: 'Karma points not found' });
        }

        res.status(200).json(karmaPoints);
    } catch (error) {
        console.error('Error getting karma points:', error);
        res.status(500).json({ message: 'Failed to get karma points' });
    }
};

// deduct karma points for a user
exports.deductKarmaPoints = async (req, res) => {
    const { points } = req.body;
    const userId = req.user.id;

    try {
        // Check if the user exists
        const karmaPoints = await KarmaPoints.findOne({ userId });
        if (!karmaPoints) {
            return res.status(404).json({ message: 'Karma points not found' });
        }

        // Deduct points from the user's karma points
        karmaPoints.points -= points;
        await karmaPoints.save();

        res.status(200).json({ message: 'Karma points deducted successfully', karmaPoints });
    } catch (error) {
        console.error('Error deducting karma points:', error);
        res.status(500).json({ message: 'Failed to deduct karma points' });
    }
};

exports.getDailyKarmaPoints = async (req, res) => {
    const userId = req.user.id;
    const dailyPoints = 100;

    try {
        let karmaPoints = await KarmaPoints.findOne({ userId });

        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize

        if (!karmaPoints) {
            // First time
            karmaPoints = new KarmaPoints({
                userId,
                points: dailyPoints,
                lastDailyPointsDate: today,
                currentStreakDay: 1
            });
            await karmaPoints.save();
            return res.status(200).json({ points: karmaPoints.points, currentStreakDay: 1, message: "Day 1 reward granted!" });
        }

        const lastDate = karmaPoints.lastDailyPointsDate ? new Date(karmaPoints.lastDailyPointsDate) : null;
        if (lastDate) lastDate.setHours(0, 0, 0, 0);

        if (lastDate && lastDate.getTime() === today.getTime()) {
            return res.status(400).json({ message: "Daily points already claimed today.", currentStreakDay: karmaPoints.currentStreakDay });
        }

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        let newStreakDay = 1;
        if (lastDate && lastDate.getTime() === yesterday.getTime()) {
            newStreakDay = karmaPoints.currentStreakDay < 6 ? karmaPoints.currentStreakDay + 1 : 1;
        }

        karmaPoints.points += dailyPoints;
        karmaPoints.lastDailyPointsDate = today;
        karmaPoints.currentStreakDay = newStreakDay;
        await karmaPoints.save();

        return res.status(200).json({ points: karmaPoints.points, currentStreakDay: newStreakDay, message: `Day ${newStreakDay} reward granted!` });

    } catch (error) {
        console.error('Error getting daily karma points:', error);
        res.status(500).json({ message: 'Failed to get daily karma points' });
    }
};


// Delete a user's KarmaPoints document
exports.deleteRewardPoint = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await KarmaPoints.findOneAndDelete({ userId });
        if (!result) {
            return res.status(404).json({ message: 'Karma points not found for user.' });
        }
        res.status(200).json({ message: 'Karma points deleted successfully.' });
    } catch (error) {
        console.error('Error deleting karma points:', error);
        res.status(500).json({ message: 'Failed to delete karma points' });
    }
};



