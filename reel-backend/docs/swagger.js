const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

// Load YAML files
const episodesYAML = YAML.load(path.join(__dirname, '../swagger/reelEpisodes.yaml'));

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

// Merge YAML files with the generated spec
Object.assign(swaggerSpec.paths, episodesYAML.paths);
Object.assign(swaggerSpec.components.schemas, episodesYAML.components.schemas);

module.exports = swaggerSpec;
