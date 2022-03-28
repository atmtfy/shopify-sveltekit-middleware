import { Logger, getUrlFromReq } from "./utils";
import { loadConfig } from "./config";
import SetupUtils from "./setupUtils";
const buildMiddleware = async (options) => {
    let config = await loadConfig(options);
    if (!config) {
        console.error("Failed to instantiate shopify middleware: no config loaded.");
        return (req, res, next) => { next(); };
    }
    Logger("Initializing Shopify Middleware", "setup");
    const Utils = new SetupUtils(config);
    await Utils.init();
    if (!config) {
        Logger('Failed to instantiate middleware: No config found.', 'error');
        return (req, res, next) => {
            next();
        };
    }
    return async (req, res, next) => {
        const url = getUrlFromReq(req);
        const session = await Utils.loadSession(req, res);
        let shouldContinue = true;
        if (req.url) {
            switch (url.pathname) {
                case Utils.paths.root:
                    shouldContinue = await Utils.startAuth(req, res);
                    break;
                case Utils.paths.session:
                    const resp = await Utils.loadSession(req, res);
                    if (resp) {
                        res.end(JSON.stringify(resp));
                    }
                    else {
                        res.end(JSON.stringify({ token: false, shop: url.hostname }));
                    }
                    shouldContinue = false;
                    break;
                case Utils.paths.callback:
                    shouldContinue = await Utils.handleCallback(req, res);
                    break;
                case Utils.paths.delete:
                    shouldContinue = await Utils.deleteSession(req, res);
                    break;
                default:
                    if (!session) {
                        res.writeHead(300, { 'Location': Utils.paths.root }).end();
                    }
                    break;
            }
        }
        if (shouldContinue) {
            next();
        }
        else {
            res.end();
        }
    };
};
export default buildMiddleware;
//# sourceMappingURL=middleware.js.map