const express = require('express');
const appConfig = require('./utils/config');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

import authRoutes from './routes/auth';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  

// Swagger documentation
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Safebox API',
            version: '1.0.0',
            description: 'REST API for managing and storing personal data',
            contact: {
                name: 'API Support',
                email: 'support@safebox.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: `http://localhost:${appConfig.PORT}`,
                description: `${appConfig.NODE_ENV} server`,
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token',
                },
            },
        },
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization endpoints'
            },
            {
                name: 'Health',
                description: 'API health check endpoints'
            }
        ]
    },
    apis: ['./src/routes/*.ts', './src/routes/*.js', './src/models/*.ts', './src/models/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/auth', authRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-12-01T10:00:00.000Z"
 */
app.get('/health', (req: any, res: any) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;