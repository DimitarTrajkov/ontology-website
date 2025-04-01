// swagger.js (using YAML - recommended)
const swaggerDefinition = {
    openapi: '3.0.0', // Important: Specify OpenAPI version
    info: {
      title: 'Brain Stroke Catalog', // Replace with your API title
      version: '1.0.0', // Replace with your API version
      description: 'API used for the InsightML website', // Replace with your API description
    },
  };
  
  const options = {
    swaggerDefinition,
    apis: ['./server.js', './controllers/*.js'], // Important: Include server.js and controllers
  };
  
  const swaggerJSDoc = require('swagger-jsdoc');
  const swaggerSpec = swaggerJSDoc(options);
  
  module.exports = swaggerSpec;