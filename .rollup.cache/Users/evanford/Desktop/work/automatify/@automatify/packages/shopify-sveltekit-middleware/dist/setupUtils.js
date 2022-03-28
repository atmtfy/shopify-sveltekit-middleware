import pathedStorage from "./sessionStorage";
import Shopify from "@shopify/shopify-api";
import { Session } from "@shopify/shopify-api/dist/auth/session";
import { getShop, tryCallback, Logger, isDev, getFinalUrl, getUrlFromReq, checkCallbackParams } from "./utils";
function convertToSession(s) {
    let toReturn = new Session(s.id, s.shop, s.state, s.isOnline);
    if (s.accessToken) {
        toReturn.accessToken = s.accessToken;
    }
    toReturn.scope = s.scope;
    if (s.scope) {
        toReturn.scope = s.scope;
    }
    return toReturn;
}
export default class Utils {
    config;
    isOnline;
    paths;
    cache;
    memoryArgs;
    constructor(config) {
        this.config = config;
        this.cache = [];
        if (this.config.storage?.disableMemory) {
            this.cache = false;
        }
        this.isOnline = this.config.env.isOnline != undefined ? this.config.env.isOnline : true;
        this.paths = {
            root: '/auth',
            delete: '/delete',
            callback: '/callback',
            session: '/_shopify_session'
        };
    }
    async init() {
        this.setupPaths();
        await this.setupContext();
    }
    setupPaths() {
        if (typeof this.config.auth == 'object') {
            this.paths.root = this.config.auth.root;
            this.paths.callback = this.config.auth.callback;
            this.paths.delete = this.config.auth.delete;
        }
    }
    checkDevIntercept(shop) {
        if (!shop) {
            return false;
        }
        if (isDev() && this.config.dev) {
            let needle = typeof this.config.dev.host == 'string' ? this.config.dev.host : 'localhost';
            if (shop == needle && 'session' in this.config.dev) {
                Logger(`Mocking shop ${needle}' as ${this.config.dev.session.shop}`, 'info');
                return convertToSession(this.config.dev.session);
            }
        }
        return false;
    }
    configureSessionStorage(options) {
        if (typeof options.storage == 'object') {
            if (options.storage.customSessionStorage) {
                return options.storage.customSessionStorage;
            }
            else if (options.storage.path) {
                return pathedStorage(options.storage.path);
            }
        }
        else {
            return undefined;
        }
    }
    async setupContext() {
        let config = {
            API_KEY: this.config.env.apiKey,
            API_SECRET_KEY: this.config.env.secret,
            SCOPES: [this.config.env.scopes],
            HOST_NAME: this.config.env.host.replace(/https:\/\//, ''),
            API_VERSION: this.config.env.apiVersion,
            IS_EMBEDDED_APP: this.config.env.embedded,
        };
        const SessionStorage = this.configureSessionStorage(this.config);
        if (SessionStorage) {
            Logger('Initialized custom session from config.', 'info');
            config.SESSION_STORAGE = this.configureSessionStorage(this.config);
        }
        else if (!this.config.storage?.disableMemory) {
            Logger('Initialized default memory storage.', 'info');
            const customMemoryStorage = await this.setupMemory();
            config.SESSION_STORAGE = customMemoryStorage;
        }
        else {
            Logger('No session storage provided. Must provide a customSessionStorage, a path, or enable memory storage (default)', 'error');
            return false;
        }
        Shopify.Context.initialize(config);
        return true;
    }
    async setupMemory() {
        var storage = [];
        const self = this;
        if (this.config.storage?.disableMemory) {
            Logger('Did not init memory storage: Memory storage disabled in options', 'info');
            return;
        }
        if (this.config.callbacks.memory.init) {
            const value = await tryCallback(this.config.callbacks.memory.init);
            if (value) {
                storage = (value);
            }
        }
        async function loader(id) {
            if (storage) {
                return storage.find(s => s.id == id);
            }
            return;
        }
        async function storer(session) {
            if (storage) {
                storage[session.shop] = session;
            }
            let callbackFinished = true;
            if (self.config.callbacks.shop.save) {
                callbackFinished = await tryCallback(self.config.callbacks.shop.save, session);
            }
            if (callbackFinished) {
                return true;
            }
            return false;
        }
        async function deleter(id) {
            let deleted = false;
            if (storage) {
                const index = storage.findIndex(v => v.id == id);
                if (storage && index) {
                    storage.splice(index, 1);
                    deleted = true;
                }
            }
            let callbackFinished = true;
            if (self.config.callbacks.shop.delete) {
                callbackFinished = await tryCallback(self.config.callbacks.shop.delete, id);
            }
            if (callbackFinished && deleted) {
                return true;
            }
            return false;
        }
        return new Shopify.Session.CustomSessionStorage(storer, loader, deleter);
    }
    getOfflineSession() {
    }
    getCachedSession(req, res) {
        const id = Shopify.Auth.getCurrentSessionId(req, res);
        if (id && this.cache) {
            const item = this.cache.find(v => v.id == id);
            if (item && item.isActive()) {
                return item;
            }
        }
        return;
    }
    async loadSession(req, res) {
        const cachedSession = this.getCachedSession(req, res);
        if (cachedSession) {
            return cachedSession;
        }
        let url = getUrlFromReq(req);
        let sessionLoaded = await Shopify.Utils.loadCurrentSession(req, res, this.isOnline);
        if (url) {
            const devIntercept = this.checkDevIntercept(url.hostname);
            if (devIntercept) {
                return devIntercept;
            }
        }
        return sessionLoaded;
    }
    async saveSession(session) {
        let callbackFinished = true;
        if (this.config.callbacks.shop.save) {
            callbackFinished = await tryCallback(this.config.callbacks.shop.save, session);
        }
        const saved = await Shopify.Context.SESSION_STORAGE.storeSession(session);
        if (saved && callbackFinished) {
            return true;
        }
        return false;
    }
    async deleteSession(req, res) {
        let callbackFinished = true;
        if (this.config.callbacks.shop.delete) {
            if (req.headers.host) {
                callbackFinished = await tryCallback(this.config.callbacks.shop.delete, req.headers.host);
            }
        }
        const deleted = await Shopify.Utils.deleteCurrentSession(req, res);
        if (callbackFinished && deleted) {
            return true;
        }
        return false;
    }
    async handleCallback(req, res) {
        Logger('Starting callback for auth process.', "info");
        const params = checkCallbackParams(getUrlFromReq(req));
        if (!params) {
            res.writeHead(500).end('Error: malformed query returned to Shopify OAuth Callback. Missing a required parameter from { code, timestamp, state, shop }');
            return false;
        }
        try {
            await Shopify.Auth.validateAuthCallback(req, res, params);
            res.writeHead(300, { 'Location': getFinalUrl(this.config, params) }).end();
        }
        catch (e) {
            const msg = 'Error: Could not validate auth query: ' + (e instanceof Error ? e.message : '');
            Logger(msg, 'error');
            res.writeHead(500).end(msg);
        }
    }
    async startAuth(req, res) {
        const shop = getShop(getUrlFromReq(req));
        if (!shop) {
            res.writeHead(500);
            res.end(`Failed to complete OAuth process: no shop name found`);
            return false;
        }
        try {
            const authRoute = await Shopify.Auth.beginAuth(req, res, shop, this.paths.callback, this.isOnline);
            res.writeHead(302, { Location: authRoute });
            res.end();
            return false;
        }
        catch (e) {
            const msg = 'Error: Could not validate auth query: ' + (e instanceof Error ? e.message : '');
            Logger(msg, 'error');
            res.writeHead(500).end(msg);
            return false;
        }
    }
}
//# sourceMappingURL=setupUtils.js.map