'use strict';

var middleware = require('./middleware-14ad2e09.js');
require('tty');
require('fs');
require('path');
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
        configureServer(server) {
            return () => {
                middleware.Logger("Initializing Shopify Middleware", "setup");
                server.middlewares.use(middleware.middleware);
            };
        }
    };
}

module.exports = createPlugin;
//# sourceMappingURL=main.cjs.js.map
