const express = require('express');
const router = express.Router();
const episodesController = require('../controllers/reelEpisodesController');
const upload = require('../utils/upload');
const { authenticate } = require('../middlewares/authMiddleware');

// Episode management routes
router.post('/:reelId/episodes', upload.single('video'), authenticate, episodesController.createEpisode);
router.get('/:reelId/episodes', episodesController.getReelEpisodes);

// Saved episodes route (must come before /:episodeId routes)
router.get('/saved', authenticate, episodesController.getUserSavedEpisodes);

// Episode CRUD routes
router.get('/:episodeId', episodesController.getEpisode);
router.put('/:episodeId', authenticate, episodesController.updateEpisode);
router.delete('/:episodeId', authenticate, episodesController.deleteEpisode);

// Like and save routes
router.post('/:episodeId/like', authenticate, episodesController.toggleLike);
router.post('/:episodeId/save', authenticate, episodesController.toggleSave);

module.exports = router;
