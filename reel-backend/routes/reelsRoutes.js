
const express = require('express');
const upload = require('../utils/upload'); 
const router = express.Router();
const reelsController = require('../controllers/reelsController'); 
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post(
    '/create',
    upload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'coverPhoto', maxCount: 1 },
    ]),
    authenticate,authorize('User'),
    reelsController.createReel
  );
router.get('/', reelsController.getAllReels);
router.get('/:id', reelsController.getReelById);
router.put('/:id', reelsController.updateReel);
router.delete('/:id', reelsController.deleteReel);

module.exports = router;


/**
 * @swagger
 * tags:
 *   - name: Reels
 *     description: Reels endpoints
 * 
 * /reels/create:
 *   post:
 *     tags:
 *       - Reels
 *     summary: Upload a reel (video + cover photo)
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - video
 *               - coverPhoto
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My First Reel"
 *               description:
 *                 type: string
 *                 example: "A short travel vlog from my Bhutan trip"
 *               caption:
 *                 type: string
 *                 example: "Wandering through the mountains 🏞️"
 *               category:
 *                 type: string
 *                 example: "Travel"
 *               userId:
 *                 type: string
 *                 description: The ID of the user uploading the reel
 *                 example: "652c0f1d1a4f2b3e9cdee01c"
 *               video:
 *                 type: string
 *                 format: binary
 *               coverPhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Reel created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
