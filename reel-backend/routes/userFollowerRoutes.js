
const express = require('express');
const router = express.Router();
const { followUser, unfollowUser, getFollowers, getFollowing ,isFollowing} = require('../controllers/userFollowersController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post('/follow/:userId', authenticate, followUser);
router.delete('/unfollow/:userId', authenticate, unfollowUser);
router.get('/followers/:userId', authenticate, getFollowers);
router.get('/following/:userId', authenticate, getFollowing);
router.get('/is-following/:userId', authenticate, isFollowing);

module.exports = router;

// Swagger
/**
 * @swagger
 * tags:
 *   name: User Followers
 *   description: User Followers management
 */

/**
 * @swagger
 * /user-followers/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags: [User Followers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User followed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user-followers/unfollow/{userId}:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [User Followers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user-followers/followers/{userId}:
 *   get:
 *     summary: Get followers of a user
 *     tags: [User Followers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of followers
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user-followers/following/{userId}:
 *   get:
 *     summary: Get following of a user
 *     tags: [User Followers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of following
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user-followers/is-following/{userId}:
 *   get:
 *     summary: Check if user is following another user
 *     tags: [User Followers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User is following another user
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */