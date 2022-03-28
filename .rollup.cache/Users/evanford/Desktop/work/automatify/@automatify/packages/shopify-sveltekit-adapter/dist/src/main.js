import { startAuth, handleCallback, handleDelete } from "./handler";
import setupContext from "./context";
import Logger from "./logger";
const defaultOptions = {
    auth: "/auth"
};
export default function createPlugin(options = {}) {
    const pluginOptions = {
        ...defaultOptions,
        ...options,
    };
    if (!pluginOptions.auth) {
        throw new Error("options.authPath should be string or function which returns a string.");
    }
    const pathsToWatch = typeof pluginOptions.auth == "string"
        ? { root: pluginOptions.auth, callback: pluginOptions.auth + '/callback', delete: pluginOptions.auth + '/delete' }
        : pluginOptions.auth;
    return {
        name: 'Sveltekit Shopify Middleware',
        configureServer(server) {
            return () => {
                setupContext(options, "This is called at tthe main");
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
                                console.log(url.pathname);
                                break;
                        }
                    }
                    shouldContinue && next();
                });
            };
        }
    };
}
//# sourceMappingURL=main.js.map