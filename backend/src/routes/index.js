const express = require('express');
const router = express.Router();
const usersRouter = require('./users');
const authRouter = require('./auth');
const errorDocsRouter = require('./errorDocs');

function setupRoutes(app, apiPrefix) {
    const apiRouter = express.Router();

    apiRouter.use('/users', usersRouter);
    apiRouter.use('/auth', authRouter);
    if (process.env.NODE_ENV !== 'production') {
        apiRouter.use('/errors', errorDocsRouter);
    }

    apiRouter.use('/', (req, res) => {
        res.status(404).json({
            error: 'Route not found',
            path: req.originalUrl,
            method: req.method,
            suggestion: 'Check /api-docs for available endpoints'
        });
    });

    apiRouter.get(`${apiPrefix}/health`, (req, res) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0'
        });
    });

    app.use(apiPrefix, apiRouter);
}

module.exports = {setupRoutes};