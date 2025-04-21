const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

// Swagger JSDoc options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Reel App API',
      version: '1.0.0',
      description: 'API documentation for the Reel App backend.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Automatically scan your routes for Swagger JSDoc comments
  apis: [path.join(__dirname, '../routes/**/*.js')], // Adjust path to your routes folder
};

// Generate Swagger specification based on the above options
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
