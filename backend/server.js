const app = require('./app');
const { connectDatabase } = require('./config/database');
const { logger } = require('./src/middleware/logger');
const { syncPermissions } = require('./src/services/permissionSync');

const port = process.env.PORT || 3000;

let server;

const startServer = async () => {
    try {
        await connectDatabase();
        logger.info(`MongoDB Connected`);

        // Sync endpoint permissions to database
        try {
            const syncResults = await syncPermissions(app);
            logger.info('Permissions synchronized', {
                created: syncResults.created.length,
                deleted: syncResults.deleted.length,
                unchanged: syncResults.unchanged.length
            });
        } catch (syncError) {
            logger.error('Permission sync failed', { error: syncError.message });
            // Continue startup even if sync fails
        }

        server = app.listen(port, () => {
            logger.info(`Server is running`, {
                port: port,
                environment: process.env.NODE_ENV || 'development',
                apiPrefix: process.env.API_PREFIX || '/api/v1',
                timestamp: new Date().toISOString()
            });

            console.log(`Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode.`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Port ${port} is already in use.`);
                console.error(error.message);
            } else {
                logger.error(`Server error: ${error.message}`);
            }
            process.exit(1);
        });
    } catch (err) {
        logger.error('Failed to start server', {error: err.message});
        console.error(err);
        process.exit(1);
    }
}

const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    console.log('Received ${signal}. Shutting down gracefully...');

    if (server) {
        server.close((err) => {
            if (err) {
                logger.error('Error during server shutdown', {error: err.message});
                console.exit(1);
            }

            logger.info('Server closed successfully.');
            console.log('Server closed successfully.');
            process.exit(0);
        });

        setTimeout(() => {
            logger.error('Forced shutdown due to timeout.');
            console.error('Forced shutdown due to timeout.');
            process.exit(1);
        }, 30000); // 30 seconds timeout
    } else {
        process.exit(0);
    }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    console.error('❌ Unbehandelter Fehler:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { promise, reason });
    console.error('❌ Unbehandelte Promise-Ablehnung:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
});

if (require.main === module) {
    startServer();
}

module.exports = { startServer, gracefulShutdown };