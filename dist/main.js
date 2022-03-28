import { b as buildMiddleware } from './middleware-a0345945.js';
import 'tty';
import 'fs';
import 'path';
import 'url';
import 'crypto';
import 'http';
import 'buffer';
import 'stream';
import 'util';
import 'https';
import 'zlib';

function createPlugin(options = {}) {
    return {
        name: 'Sveltekit Shopify Middleware',
        async configureServer(server) {
            const md = await buildMiddleware(options);
            if (md) {
                server.middlewares.use(md);
            }
        }
    };
}

export { createPlugin as default };
//# sourceMappingURL=main.js.map
