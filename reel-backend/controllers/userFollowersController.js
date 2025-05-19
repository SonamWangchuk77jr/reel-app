
const UserFollower = require('../models/UserFollower');
const User = require('../models/User');


exports.followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.user.id;

        if (!userId || !followerId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Follower ID are required'
            });
        }

        if (userId === followerId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot follow yourself'
            });
        }

        const existingFollower = await UserFollower.findOne({ userId, followerId });
        if (existingFollower) {
            return res.status(400).json({
                success: false,
                message: 'You are already following this user'
            });
        }

        const newFollower = new UserFollower({ userId, followerId });
        await newFollower.save();

        res.status(200).json({
            success: true,
            message: 'User followed successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.user.id;

        if (!userId || !followerId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Follower ID are required'
            });
        }

        if (userId === followerId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot unfollow yourself'
            });
        }

        const existingFollower = await UserFollower.findOne({ userId, followerId });
        if (!existingFollower) {
            return res.status(400).json({
                success: false,
                message: 'You are not following this user'
            });
        }

        await UserFollower.findOneAndDelete({ userId, followerId });

        res.status(200).json({
            success: true,
            message: 'User unfollowed successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;

        //get count
        const count = await UserFollower.countDocuments({ userId });
        console.log('count::', count);
        res.status(200).json(count);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const count = await UserFollower.countDocuments({ followerId: userId });
        res.status(200).json(count);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// check if user is following another user
exports.isFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const followerId = req.user.id;

        if (!userId || !followerId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Follower ID are required'
            });
        }

        if (userId === followerId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot follow yourself'
            });
        }

        const existingFollower = await UserFollower.findOne({ userId, followerId });
        if (!existingFollower) {
            return res.status(400).json({
                success: false,
                message: 'You are not following this user'
            });
        }

        res.status(200).json({
            success: true,
            message: 'You are following this user'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};