const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { PORT } = require('./config/config');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

// Route imports
const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// ...import other routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// ...add other routes

// Root route
app.get('/', (req, res) => {
  res.send('🎬 API is running...');
});

// DB connection and server start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
