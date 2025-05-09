const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { PORT } = require('./config/config');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');


// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reelsRoutes = require('./routes/reelsRoutes');
const episodesRoutes = require('./routes/reelEpisodesRoutes');
const adsRoutes = require('./routes/adsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/reels', reelsRoutes);
app.use('/api/episodes', episodesRoutes);
app.use('/api/ads', adsRoutes);


// Root route
app.get('/', (req, res) => {
  res.send('🎬 API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// DB connection and server start
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });
