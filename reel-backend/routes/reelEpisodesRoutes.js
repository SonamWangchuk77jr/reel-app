const express = require('express');
const router = express.Router();
const { videoUpload } = require('../utils/upload');
const episodesController = require('../controllers/reelEpisodesController');
const { authenticate } = require('../middlewares/authMiddleware');

// Get all episodes list
router.get('/', episodesController.getAllEpisodes);

// Episode management routes
router.post('/:reelId/episodes', videoUpload.single('video'), authenticate, episodesController.createEpisode);
router.get('/:reelId/episodes', episodesController.getReelEpisodes);
router.get('/:reelId/episodes/approved', episodesController.getApprovedReelEpisodes);
router.patch('/:episodeId/episodes/unlocked', authenticate, episodesController.unlockEpisode);

// Saved episodes route (must come before /:episodeId routes)
router.get('/saved', authenticate, episodesController.getUserSavedEpisodes);

// Episode CRUD routes
router.patch('/:episodeId/status', authenticate, episodesController.updateEpisodeStatus);
router.get('/:episodeId', episodesController.getEpisode);
router.put('/:episodeId', authenticate, episodesController.updateEpisode);
router.delete('/:episodeId', authenticate, episodesController.deleteEpisode);

// Like and save routes
router.post('/:episodeId/like', authenticate, episodesController.toggleLike);
router.post('/:episodeId/save', authenticate, episodesController.toggleSave);

// Check if user has liked or saved an episode
router.get('/:episodeId/liked-check', authenticate, episodesController.hasLiked);
router.get('/:episodeId/saved-check', authenticate, episodesController.hasSaved);

module.exports = router;




