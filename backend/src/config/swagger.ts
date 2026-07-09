import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ascend AI SaaS API Documentation',
      version: '1.0.0',
      description: 'Production API specification for Ascend platform features',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'V1 Development Server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
