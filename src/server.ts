const appInstance = require('./app');
const environmentVars = require('./utils/config');

const server = appInstance.listen(environmentVars.PORT, () => {
    console.log(`🚀 Server running on port ${environmentVars.PORT}`);
    console.log(`🌍 Environment: ${environmentVars.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = server;