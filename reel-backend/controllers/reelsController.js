const Reels = require('../models/Reels');
const User = require('../models/User');
const cloudinary = require('../config/config').cloudinary;
const streamifier = require('streamifier');

exports.createReel = async (req, res) => {
    try {
      const { title, description,category } = req.body;
      const videoFile = req.file;
  
      if (!videoFile) {
        return res.status(400).json({ error: 'Video is required' });
      }

      if (!title || !description || !category) {
        return res.status(400).json({ error: 'All fields are required' });
      }
  
      // Get user ID from the authenticated request
      const userId = req.user.id;
  
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.status !== 'Active') {
        return res.status(403).json({ error: 'User account is not active' });
      }
  
      // Create user-specific folder path using the user's ID from database
      const userFolder = `reels/users/${user._id}/videos`;
  
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
  
      // Upload video directly to Cloudinary
      const videoUpload = await uploadToCloudinary(videoFile);
  
      // Save to DB with proper user reference
      const newReel = new Reels({
        title,
        description,
        category,
        video: videoUpload.secure_url,
        userId: user._id,
        status: 'pending' // Default status
      });
  
      const savedReel = await newReel.save();
      res.status(201).json(savedReel);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
};
  

exports.getAllReels = async (req, res) => {
  try {
    const reels = await Reels.find()
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: -1 });
    res.json(reels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all reels by user ID
exports.getAllReelsByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const reels = await Reels.find({ userId })
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: -1 });
    res.json(reels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAllReelsWithStatusApproved = async (req, res) => {
  try {
    const reels = await Reels.find({ status: 'approved' })  // filter only by status
      .populate('userId', 'name email profilePicture')      // populate the userId field correctly
      .sort({ createdAt: -1 });

    res.status(200).json(reels);
  } catch (err) {
    console.error('Error fetching approved reels:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getReelById = async (req, res) => {
  try {
    const reel = await Reels.findById(req.params.id)
      .populate('userId', 'name email profilePicture');
    res.json(reel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReel = async (req, res) => {
  try {
    const reel = req.reel; // Get reel from middleware
    const userId = req.user.id;

    // Check if user is the owner of the reel
    if (reel.userId.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to update this reel' });
    }

    const { title, description } = req.body;

    if (title) reel.title = title;
    if (description) reel.description = description;

    const updatedReel = await reel.save();
    res.json(updatedReel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReel = async (req, res) => {
  try {
    await Reels.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reel deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReelStatus = async (req, res) => {
  try {
    const reel = req.reel; // Get reel from middleware
    const { status } = req.body;

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    reel.status = status;
    const updatedReel = await reel.save();
    res.json(updatedReel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const reel = req.reel; // Get reel from middleware
    const userId = req.user.id;

    // Check if user already liked the reel
    const alreadyLiked = reel.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike the reel
      reel.likes = reel.likes.filter(id => id.toString() !== userId);
    } else {
      // Like the reel
      reel.likes.push(userId);
    }

    await reel.save();
    res.json({ 
      message: alreadyLiked ? 'Reel unliked successfully' : 'Reel liked successfully',
      reel,
      action: alreadyLiked ? 'unliked' : 'liked'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleSave = async (req, res) => {
  try {
    const reel = req.reel; // Get reel from middleware
    const userId = req.user.id;

    // Check if user already saved the reel
    const alreadySaved = reel.saves.includes(userId);
    
    if (alreadySaved) {
      // Remove from saved
      reel.saves = reel.saves.filter(id => id.toString() !== userId);
    } else {
      // Save the reel
      reel.saves.push(userId);
    }

    await reel.save();
    res.json({ 
      message: alreadySaved ? 'Reel unsaved successfully' : 'Reel saved successfully',
      reel,
      action: alreadySaved ? 'unsaved' : 'saved'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.hasLiked = async (req, res) => {
  try {
    const { id: reelId } = req.params;
    const userId = req.user.id;

    console.log('reelId::', reelId, 'userId::', userId);

    if (!reelId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Reel ID and User ID are required'
      });
    }

    const reel = await Reels.findById(reelId);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    const hasLiked = reel.likes.includes(userId);
    res.status(200).json({
      success: true,
      hasLiked
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.hasSaved = async (req, res) => {
  try {
    const { id:reelId } = req.params;
    const userId = req.user.id;

    if (!reelId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Reel ID and User ID are required'
      });
    }

    const reel = await Reels.findById(reelId);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    const hasSaved = reel.saves.includes(userId);
    res.status(200).json({
      success: true,
      hasSaved
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserSavedReels = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const savedReels = await Reels.find({ 
      saves: userId,
      status: 'approved'
    })
    .populate('userId', 'name email profilePicture')
    .sort({ createdAt: -1 });

    res.json(savedReels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.totalReels = async (req, res) => {
  try {
    const totalReels = await Reels.countDocuments();
    res.status(200).json({ totalReels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// get reels by category
exports.getReelsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    // if all then get all reels
    if (category === 'all') {
      const reels = await Reels.find()
        .populate('userId', 'name email profilePicture')
        .sort({ createdAt: -1 });
      return res.json(reels);
    }
    // else get reels by category
    const reels = await Reels.find({ category })
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: -1 });
    return res.json(reels);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};



