const ReelEpisodes = require('../models/ReelEpisodes');
const Reels = require('../models/Reels');
const cloudinary = require('../config/config').cloudinary;
const streamifier = require('streamifier');

// Toggle like for an episode
exports.toggleLike = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const userId = req.user.id;

    const episode = await ReelEpisodes.findById(episodeId);
    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Check if user already liked the episode
    const alreadyLiked = episode.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike the episode
      episode.likes = episode.likes.filter(id => id.toString() !== userId);
    } else {
      // Like the episode
      episode.likes.push(userId);
    }

    await episode.save();
    res.status(200).json({
      success: true,
      message: alreadyLiked ? 'Episode unliked successfully' : 'Episode liked successfully',
      data: episode,
      action: alreadyLiked ? 'unliked' : 'liked'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling episode like',
      error: error.message
    });
  }
};

// Toggle save for an episode
exports.toggleSave = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const userId = req.user.id;

    if (!episodeId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Episode ID and User ID are required'
      });
    }

    // First check if the episode exists
    const episode = await ReelEpisodes.findById(episodeId);
    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Initialize saves array if it doesn't exist
    if (!episode.saves) {
      episode.saves = [];
    }

    // Check if the user has already saved the episode
    const isSaved = episode.saves.includes(userId);

    // Update the episode using $pull or $addToSet
    const updateOperation = isSaved 
      ? { $pull: { saves: userId } }
      : { $addToSet: { saves: userId } };

    const updatedEpisode = await ReelEpisodes.findByIdAndUpdate(
      episodeId,
      updateOperation,
      { new: true }
    )
    .populate('reelId', 'title description')
    .populate('likes', 'username')
    .populate('saves', 'username')
    .lean();

    // Remove the __v field from the response
    delete updatedEpisode.__v;

    res.status(200).json({
      success: true,
      message: isSaved ? 'Episode unsaved successfully' : 'Episode saved successfully',
      data: updatedEpisode,
      action: isSaved ? 'unsaved' : 'saved'
    });
  } catch (error) {
    console.error('Error in toggleSave:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling episode save',
      error: error.message
    });
  }
};

// Get user's saved episodes
exports.getUserSavedEpisodes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const savedEpisodes = await ReelEpisodes.find({ 
      saves: { $in: [userId] }
    })
    .populate('reelId', 'title description')
    .populate('likes', 'username')
    .populate('saves', 'username')
    .lean()
    .sort({ createdAt: -1 });

    // Ensure each episode has valid likes and saves arrays
    const processedEpisodes = savedEpisodes.map(episode => ({
      ...episode,
      likes: Array.isArray(episode.likes) ? episode.likes : [],
      saves: Array.isArray(episode.saves) ? episode.saves : []
    }));

    res.status(200).json({
      success: true,
      count: processedEpisodes.length,
      data: processedEpisodes
    });
  } catch (error) {
    console.error('Error in getUserSavedEpisodes:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting saved episodes',
      error: error.message
    });
  }
};

// Create a new episode for a reel
exports.createEpisode = async (req, res) => {
  try {
    const { reelId } = req.params;
    const { episodeNumber, episodeName, description, caption } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({
        success: false,
        message: 'Video is required'
      });
    }

    if (!episodeNumber || !episodeName || !description) {
      return res.status(400).json({
        success: false,
        message: 'Episode number, name and description are required'
      });
    }

    // Check if episode number already exists for this reel
    const existingEpisode = await ReelEpisodes.findOne({ reelId, episodeNumber });
    if (existingEpisode) {
      return res.status(400).json({
        success: false,
        message: 'Episode number already exists for this reel'
      });
    }

    // Check if the reel exists
    const reel = await Reels.findById(reelId);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    // Create user-specific folder path
    const userFolder = `reels/users/${reel.userId}/episodes`;

    // Create a promise to handle the upload
    const uploadToCloudinary = (file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: userFolder,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        // Stream the file buffer directly to Cloudinary
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    };

    // Upload video to Cloudinary
    const videoUpload = await uploadToCloudinary(videoFile);

    // Create new episode
    const episode = await ReelEpisodes.create({
      episodeNumber,
      episodeName,
      description,
      caption,
      videoUrl: videoUpload.secure_url,
      reelId
    });

    res.status(201).json({
      success: true,
      message: 'Episode created successfully',
      data: episode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating episode',
      error: error.message
    });
  }
};

// Get all episodes for a reel
exports.getReelEpisodes = async (req, res) => {
  try {
    const { reelId } = req.params;

    // Check if the reel exists
    const reel = await Reels.findById(reelId);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    // Get all episodes for this reel
    const episodes = await ReelEpisodes.find({ reelId })
      .sort({ episodeNumber: 1 }) // Sort by episode number
      .populate('reelId', 'title description')
      .populate('likes', 'username')
      .populate('saves', 'username')
      .lean();

    // Ensure each episode has valid likes and saves arrays
    const processedEpisodes = episodes.map(episode => ({
      ...episode,
      likes: Array.isArray(episode.likes) ? episode.likes : [],
      saves: Array.isArray(episode.saves) ? episode.saves : []
    }));

    res.status(200).json({
      success: true,
      count: processedEpisodes.length,
      data: processedEpisodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting episodes',
      error: error.message
    });
  }
};

// Update an episode
exports.updateEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const { episodeName, description, caption } = req.body;
    const videoFile = req.file;

    const updateData = {
      episodeName,
      description,
      caption
    };

    // If a new video is uploaded, upload it to Cloudinary
    if (videoFile) {
      const userFolder = `reels/users/${req.user.id}/episodes`;
      
      const uploadToCloudinary = (file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'video',
              folder: userFolder,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
      };

      const videoUpload = await uploadToCloudinary(videoFile);
      updateData.videoUrl = videoUpload.secure_url;
    }

    const episode = await ReelEpisodes.findByIdAndUpdate(
      episodeId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Episode updated successfully',
      data: episode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating episode',
      error: error.message
    });
  }
};

// Delete an episode
exports.deleteEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;

    const episode = await ReelEpisodes.findByIdAndDelete(episodeId);

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Episode deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting episode',
      error: error.message
    });
  }
};

// Get a particular episode
exports.getEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;
    
    if (!episodeId) {
      return res.status(400).json({
        success: false,
        message: 'Episode ID is required'
      });
    }

    const episode = await ReelEpisodes.findById(episodeId)
      .populate('reelId', 'title description')
      .populate('likes', 'username')
      .populate('saves', 'username')
      .lean(); // Convert to plain JavaScript object

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Ensure likes and saves arrays exist and are arrays
    episode.likes = Array.isArray(episode.likes) ? episode.likes : [];
    episode.saves = Array.isArray(episode.saves) ? episode.saves : [];

    res.status(200).json({
      success: true,
      data: episode
    });
  } catch (error) {
    console.error('Error in getEpisode:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting episode',
      error: error.message
    });
  }
};

