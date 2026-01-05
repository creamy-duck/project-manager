const express = require('express');
const router = express.Router();
const {
    flattenErrorCodes,
    groupByStatusCode,
    groupByCategory,
    generateMarkdown
} = require('../errors');

/**
 * @route   GET /errors
 * @desc    Get all error codes as JSON (default)
 * @access  Public
 */
router.get('/', (req, res) => {
    const format = req.query.format || 'json';
    const groupBy = req.query.groupBy;

    if (format === 'markdown' || format === 'md') {
        res.set('Content-Type', 'text/markdown');
        return res.send(generateMarkdown());
    }

    let data;
    if (groupBy === 'status') {
        data = groupByStatusCode();
    } else if (groupBy === 'category') {
        data = groupByCategory();
    } else {
        data = flattenErrorCodes();
    }

    res.json({
        success: true,
        count: Array.isArray(data) ? data.length : Object.values(data).flat().length,
        data
    });
});

/**
 * @route   GET /errors/markdown
 * @desc    Get error codes as markdown documentation
 * @access  Public
 */
router.get('/markdown', (req, res) => {
    res.set('Content-Type', 'text/markdown');
    res.send(generateMarkdown());
});

/**
 * @route   GET /errors/html
 * @desc    Get error codes as styled HTML page
 * @access  Public
 */
router.get('/html', (req, res) => {
    const grouped = groupByCategory();
    const total = flattenErrorCodes().length;

    const categoryDescriptions = {
        VALIDATION: 'Input validation errors',
        AUTH: 'Authentication errors',
        AUTHZ: 'Authorization/permission errors',
        RESOURCE: 'Resource operation errors',
        REQUEST: 'Request format errors',
        SERVER: 'Internal server errors'
    };

    const statusColors = {
        400: '#f59e0b',
        401: '#ef4444',
        403: '#dc2626',
        404: '#6b7280',
        409: '#8b5cf6',
        500: '#991b1b'
    };

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Error Codes Reference</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            line-height: 1.6;
            padding: 2rem;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: #f8fafc;
        }
        .subtitle {
            color: #94a3b8;
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }
        .stats {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .stat {
            background: #1e293b;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border: 1px solid #334155;
        }
        .stat-value { font-size: 1.5rem; font-weight: bold; color: #3b82f6; }
        .stat-label { font-size: 0.8rem; color: #94a3b8; }
        .category {
            background: #1e293b;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            border: 1px solid #334155;
            overflow: hidden;
        }
        .category-header {
            background: #334155;
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .category-title { font-weight: 600; font-size: 1.1rem; }
        .category-desc { font-size: 0.85rem; color: #94a3b8; }
        .category-count {
            background: #3b82f6;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.8rem;
        }
        table { width: 100%; border-collapse: collapse; }
        th {
            text-align: left;
            padding: 0.75rem 1.5rem;
            background: #1e293b;
            color: #94a3b8;
            font-weight: 500;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        td {
            padding: 0.75rem 1.5rem;
            border-top: 1px solid #334155;
        }
        .code {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.85rem;
            color: #22d3ee;
        }
        .message { color: #cbd5e1; }
        .status {
            display: inline-block;
            padding: 0.2rem 0.6rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        .search-box {
            width: 100%;
            padding: 0.75rem 1rem;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 8px;
            color: #e2e8f0;
            font-size: 1rem;
            margin-bottom: 2rem;
        }
        .search-box:focus { outline: none; border-color: #3b82f6; }
        .search-box::placeholder { color: #64748b; }
        .hidden { display: none; }
        .formats {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        .format-btn {
            padding: 0.5rem 1rem;
            background: #334155;
            border: none;
            border-radius: 6px;
            color: #e2e8f0;
            cursor: pointer;
            font-size: 0.85rem;
            text-decoration: none;
        }
        .format-btn:hover { background: #475569; }
    </style>
</head>
<body>
    <div class="container">
        <h1>API Error Codes Reference</h1>
        <p class="subtitle">Auto-generated from errorCodes.js</p>

        <div class="formats">
            <a href="?format=json" class="format-btn">JSON</a>
            <a href="markdown" class="format-btn">Markdown</a>
            <a href="?groupBy=status" class="format-btn">Group by Status</a>
        </div>

        <div class="stats">
            <div class="stat">
                <div class="stat-value">${total}</div>
                <div class="stat-label">Total Error Codes</div>
            </div>
            <div class="stat">
                <div class="stat-value">${Object.keys(grouped).length}</div>
                <div class="stat-label">Categories</div>
            </div>
        </div>

        <input type="text" class="search-box" placeholder="Search error codes..." id="search" onkeyup="filterCodes()">
`;

    for (const [category, errors] of Object.entries(grouped)) {
        html += `
        <div class="category" data-category="${category.toLowerCase()}">
            <div class="category-header">
                <div>
                    <div class="category-title">${category}</div>
                    <div class="category-desc">${categoryDescriptions[category] || ''}</div>
                </div>
                <span class="category-count">${errors.length}</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40%">Code</th>
                        <th style="width: 45%">Message</th>
                        <th style="width: 15%">Status</th>
                    </tr>
                </thead>
                <tbody>`;

        for (const error of errors) {
            const color = statusColors[error.statusCode] || '#64748b';
            html += `
                    <tr data-code="${error.code.toLowerCase()}" data-message="${error.message.toLowerCase()}">
                        <td><span class="code">${error.code}</span></td>
                        <td class="message">${error.message}</td>
                        <td><span class="status" style="background: ${color}20; color: ${color}">${error.statusCode}</span></td>
                    </tr>`;
        }

        html += `
                </tbody>
            </table>
        </div>`;
    }

    html += `
    </div>
    <script>
        function filterCodes() {
            const search = document.getElementById('search').value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const code = row.dataset.code || '';
                const message = row.dataset.message || '';
                const matches = code.includes(search) || message.includes(search);
                row.classList.toggle('hidden', !matches);
            });

            // Hide empty categories
            document.querySelectorAll('.category').forEach(cat => {
                const visibleRows = cat.querySelectorAll('tbody tr:not(.hidden)');
                cat.classList.toggle('hidden', visibleRows.length === 0);
            });
        }
    </script>
</body>
</html>`;

    res.set('Content-Type', 'text/html');
    res.send(html);
});

module.exports = router;
