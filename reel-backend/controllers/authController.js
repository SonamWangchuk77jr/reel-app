const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../config/config');


exports.register = async (req, res) => {
    const { name, email, password, profilePicture, role, status } = req.body;
  
    // input validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields (name, email, password)' });
    }
  
    try {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Set default role and status if not provided
      const userRole = role || 'User'; // Default role is 'User'
      const userStatus = status || 'Active'; // Default status is 'Active'
  
      // Create the new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        profilePicture,
        role: userRole,
        status: userStatus
      });
  
      // Save the user to the database
      await user.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error('Error during registration:', err); // Log the error for debugging
      res.status(500).json({ error: 'Registration failed, please try again later' });
    }
  };

  exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
  
      // 🔐 Include user's role in the token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role, // 🧠 Also return the role if needed on client
          status: user.status,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Login failed' });
    }
  };
