'use strict';

var middleware = require('./middleware-3749fec1.js');
require('tty');
require('fs');
require('path');
require('url');
require('crypto');
require('http');
require('buffer');
require('stream');
require('util');
require('https');
require('zlib');

function createPlugin(options = {}) {
    return {
        name: 'Sveltekit Shopify Middleware',
        async configureServer(server) {
            const md = await middleware.buildMiddleware(options);
            if (md) {
                server.middlewares.use(md);
            }
        }
    };
}

module.exports = createPlugin;
//# sourceMappingURL=main.cjs.map
