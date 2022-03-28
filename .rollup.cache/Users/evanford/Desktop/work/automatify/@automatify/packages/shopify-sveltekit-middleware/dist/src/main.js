import { startAuth, handleCallback, handleDelete } from "./handler";
import setupContext from "./context";
import Logger from "./logger";
import { loadConfig } from "./config";
export default function createPlugin(options = {}) {
    loadConfig(options).then(config => {
        if (!config) {
            return {
                name: 'Sveltekit Shopify Server',
                configureServer(server) {
                    Logger("Failed to initialize Shopify Middleware: no valid config supplied", "setup");
                }
            };
        }
        const pathsToWatch = typeof config.auth == "string"
            ? { root: config.auth, callback: config.auth + '/callback', delete: config.auth + '/delete' }
            : config.auth;
        return {
            name: 'Sveltekit Shopify Middleware',
            configureServer(server) {
                return () => {
                    let Tokens;
                    setupContext(options);
                    Logger("Initializing Shopify Middleware", "setup");
                    server.middlewares.use(async (req, res, next) => {
                        const origin = req.headers.origin ? req.headers.origin : `http://${req.headers.host}`;
                        const url = new URL(`${origin}${req.url}`);
                        let shouldContinue = true;
                        if (req.url && Object.values(pathsToWatch).includes(url.pathname)) {
                            switch (url.pathname) {
                                case pathsToWatch.root:
                                    shouldContinue = await startAuth(url, req, res, pathsToWatch.callback);
                                    break;
                                case pathsToWatch.callback:
                                    shouldContinue = await handleCallback(url, req, res, options);
                                    break;
                                case pathsToWatch.delete:
                                    shouldContinue = await handleDelete(url, req, res, options);
                                    break;
                                default:
                                    if (Tokens[url.hostname]) {
                                        res;
                                    }
                                    break;
                            }
                        }
                        shouldContinue && next();
                    });
                };
            }
        };
    });
}
//# sourceMappingURL=main.js.map