const express = require('express');
const { videoUpload } = require('../utils/upload');
const router = express.Router();
const reelsController = require('../controllers/reelsController'); 
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validateReel = require('../middlewares/reelValidationMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reel:
 *       type: object
 *       required:
 *         - title
 *         - video
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the reel
 *         description:
 *           type: string
 *           description: The description of the reel
 *         video:
 *           type: string
 *           format: binary
 *           description: The video file
 *         likes:
 *           type: number
 *           description: Number of likes
 *         saves:
 *           type: number
 *           description: Number of saves
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Status of the reel
 */

/**
 * @swagger
 * /reels/create:
 *   post:
 *     summary: Create a new reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [food, travel, fashion, lifestyle, beauty, fitness, technology, other]
 *     responses:
 *       201:
 *         description: Reel created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
    '/create',
    videoUpload.single('video'),
    authenticate,
    reelsController.createReel
);

/**
 * @swagger
 * /reels:
 *   get:
 *     summary: Get all reels
 *     tags: [Reels]
 *     responses:
 *       200:
 *         description: List of all reels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reel'
 *       500:
 *         description: Server error
 */
router.get('/', reelsController.getAllReels);


/**
 * @swagger
 * /reels/total:
 *   get:
 *     summary: Get total number of reels
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total number of reels
 */

router.get('/total', authenticate, reelsController.totalReels);

/**
 * @swagger
 * /reels/approved:
 *   get:
 *     summary: Get all approved reels
 *     tags: [Reels]
 *     responses:
 *       200:
 *         description: List of all approved reels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reel'
 *       500:
 *         description: Server error
 */
router.get('/approved', reelsController.getAllReelsWithStatusApproved);

/**
 * @swagger
 * /reels/saved:
 *   get:
 *     summary: Get all saved reels for the authenticated user
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved reels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reel'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/saved', authenticate, reelsController.getUserSavedReels);

/**
 * @swagger
 * /reels/{id}:
 *   get:
 *     summary: Get a specific reel by ID
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reel'
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */
router.get('/:id', validateReel, reelsController.getReelById);

/**
 * @swagger
 * /reels/user/{userId}:
 *   get:
 *     summary: Get all reels by user ID
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of reels by user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reel'
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', reelsController.getAllReelsByUserId);

/**
 * @swagger
 * /reels/{id}:
 *   put:
 *     summary: Update a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reel updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */
router.put(
    '/:id',
    validateReel,
    authenticate,
    authorize('User'),
    reelsController.updateReel
);

/**
 * @swagger
 * /reels/{id}/status:
 *   patch:
 *     summary: Update reel status (Admin only)
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin access required)
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */
router.patch(
    '/:id/status',
    validateReel,
    authenticate,
    reelsController.updateReelStatus
);

/**
 * @swagger
 * /reels/{id}/like:
 *   post:
 *     summary: Toggle like on a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Like status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reel:
 *                   $ref: '#/components/schemas/Reel'
 *                 action:
 *                   type: string
 *                   enum: [liked, unliked]
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */
router.post('/:id/like', validateReel, authenticate, reelsController.toggleLike);

/**
 * @swagger
 * /reels/{id}/save:
 *   post:
 *     summary: Toggle save on a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Save status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reel:
 *                   $ref: '#/components/schemas/Reel'
 *                 action:
 *                   type: string
 *                   enum: [saved, unsaved]
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */
router.post('/:id/save', validateReel, authenticate, reelsController.toggleSave);

/**
 * @swagger
 * /reels/{id}/remove-like:
 *   delete:
 *     summary: Remove a like from a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Like removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reel:
 *                   $ref: '#/components/schemas/Reel'
 *       400:
 *         description: User has not liked this reel
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */
router.delete('/:id/remove-like', validateReel, authenticate, reelsController.removeLike);

/**
 * @swagger
 * /reels/{id}/remove-save:
 *   delete:
 *     summary: Remove a save from a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Save removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reel:
 *                   $ref: '#/components/schemas/Reel'
 *       400:
 *         description: User has not saved this reel
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */
router.delete('/:id/remove-save', validateReel, authenticate, reelsController.removeSave);

/**
 * @swagger
 * /reels/{id}:
 *   delete:
 *     summary: Delete a reel
 *     tags: [Reels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reel not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/:id',
    validateReel,
    authenticate,
    reelsController.deleteReel
);


module.exports = router;


