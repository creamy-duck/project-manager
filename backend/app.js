const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const {parse} = require("dotenv");
const logger = require('./src/middleware/logger');
const errorHandler = require('./src/middleware/errorHandler');
const { serve: swaggerServe, setup: swaggerSetup } = require('./config/swagger');

dotenv.config();

const app = express();

app.use(helmet());

const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return req.path.startsWith('/api-docs'); // Exclude API docs from rate limiting
    }
});

app.use(limiter);
app.use(logger);

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true}));

const apiPrefix = process.env.API_PREFIX || '/api/v1';

app.use('/api-docs', swaggerServe, swaggerSetup);
//app.use('/docs', docsRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Projectmanager API is running.',
        version: '1.0.0',
        documentation: {
            interactive: '/api-docs',
            openapi_json: '/docs/openapi.json',
            openapi_yaml: '/docs/openapi.yaml'
        },
        health: `${apiPrefix}/health`,
        timestamp: new Date().toISOString()
    });
});

app.get(`${apiPrefix}/health`, (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

app.use('/', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        suggestion: 'Check /api-docs for available endpoints'
    });
});

app.use(errorHandler);

module.exports = app;