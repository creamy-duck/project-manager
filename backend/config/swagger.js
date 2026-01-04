const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const errorHandler = require("../src/middleware/errorHandler");

const apiPrefix = process.env.API_PREFIX || '/api';
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

let openApiSpec;
try {
    openApiSpec = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../../docs/openapi.json'), 'utf-8')
    );

    openApiSpec.servers = [
        {url: baseUrl + apiPrefix, description: 'Development server'}
    ];
} catch (error) {
    console.warn('OpenAPI specification not found, using basic specification.');
    openApiSpec = {
        openapi: '3.0.3',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API Documentation'
        },
        servers: [
            {url: baseUrl + apiPrefix, description: 'Development server'}
        ],
        paths: {}
    };
}

const options = {
    definition: openApiSpec,
    apis: [
        './src/routes/*.js',
        './src/models/*.js'
    ]
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerOptions = {
    explorer: true,
    customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #3b4151; }
    `,
    customSiteTitle: 'API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        requestInterceptors: (req) => {
            req.headers['X-API-Source'] = 'swagger-ui';
            return req;
        }
    }
};

module.exports = {
    serve: swaggerUi.serve,
    setup: swaggerUi.setup(swaggerSpec, swaggerOptions),
    swaggerSpec
};