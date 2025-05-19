const Ads = require('../models/Ads');
const cloudinary = require('../config/config').cloudinary;
const streamifier = require('streamifier');
const User = require('../models/User');



exports.createAds = async (req, res) => {
    try {
      const { name, point } = req.body;
      const adsVideoUrl = req.file;
  
      if (!adsVideoUrl || !adsVideoUrl.buffer) {
        return res.status(400).json({ message: 'adsVideoUrl file is required and must be a valid file' });
      }

      if (!name || !point) {
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
      const userFolder = `ads-videos/users/${user._id}/videos`;
  
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
      const adsVideoUpload = await uploadToCloudinary(adsVideoUrl);
  
      // Save to DB with proper user reference
      const newAds = new Ads({
        name,
        point,
        adsVideoUrl: adsVideoUpload.secure_url,
      });
  
      const savedAds = await newAds.save();
      res.status(201).json(savedAds);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
};


exports.getAds = async (req, res) => {
    try {
        const ads = await Ads.find();
        res.status(200).json(ads);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

exports.getRandomShuffledAdsByPoint = async (req, res) => {
  try {
    const { point } = req.params;

    // Ensure point is provided
    if (!point) {
      return res.status(400).json({ error: "Point parameter is required" });
    }

    // Fetch ads based on the point
    const ads = await Ads.find({ point });

    // If no ads found for the given point
    if (!ads.length) {
      return res.status(404).json({ message: "No ads found for this point" });
    }

    // Shuffle the ads and pick one random ad
    const randomAd = ads.sort(() => Math.random() - 0.5)[0];

    // Return the selected random ad
    res.status(200).json(randomAd);
  } catch (error) {
    // Handle any server errors
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching ads" });
  }
};



exports.totalAds = async (req, res) => {
    try {
        const totalAds = await Ads.countDocuments();
        res.status(200).json({ totalAds });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

exports.deleteAds = async (req, res) => {
    try {
        const { id } = req.params;
        const ads = await Ads.findById(id);
        if (!ads) {
            return res.status(404).json({ error: 'Ads not found' });
        }
        await Ads.findByIdAndDelete(id);
        res.status(200).json({ message: 'Ads deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}