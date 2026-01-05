const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const apiPrefix = process.env.API_PREFIX || '/api';
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

let openApiSpec;
try {
    openApiSpec = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../docs/openapi.json'), 'utf8')
    );

    openApiSpec.servers = [
        {
            url: `${baseUrl}${apiPrefix}`,
            description: 'Development server'
        }
    ];

    if (process.env.PRODUCTION_URL) {
        openApiSpec.servers.push({
            url: `${process.env.PRODUCTION_URL}${apiPrefix}`,
            description: 'Production server'
        });
    }
} catch (error) {
    console.warn('OpenAPI specification not found, using basic specification');
    openApiSpec = {
        openapi: '3.0.3',
        info: {
            title: 'Projectmanager API',
            description: 'API documentation for Projectmanager application',
            version: '1.0.0'
        },
        servers: [
            {
                url: `${baseUrl}${apiPrefix}`,
                description: 'Development server'
            }
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

const specs = swaggerJsdoc(options);

const swaggerOptions = {
    explorer: true,
    customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 20px 0; }
        .swagger-ui .info .title { color: #3b4151; }
    `,
    customSiteTitle: "Projectmanager API Documentation",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        requestInterceptor: (req) => {
            req.headers['X-API-Source'] = 'swagger-ui';
            return req;
        }
    }
};

module.exports = {
    serve: swaggerUi.serve,
    setup: swaggerUi.setup(specs, swaggerOptions),
    specs
};
