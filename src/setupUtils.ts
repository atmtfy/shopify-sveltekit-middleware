import pathedStorage from "./sessionStorage";
import Shopify, { AuthQuery } from "@shopify/shopify-api";
import { Session, CustomSessionStorage, MemorySessionStorage } from "@shopify/shopify-api/dist/auth/session";
import type { SessionInterface, ContextParams } from "@shopify/shopify-api";
import type { Options } from "./config";

import { getShop, tryCallback , Logger, isDev, getFinalUrl, getUrlFromReq, checkCallbackParams} from "./utils";
import type { IncomingMessage, ServerResponse } from "http";




function convertToSession(s:SessionInterface): Session {
  let toReturn = new Session(s.id, s.shop, s.state, s.isOnline)
  if (s.accessToken) {
  toReturn.accessToken = s.accessToken
  }
  toReturn.scope = s.scope;
  if (s.scope) {
    toReturn.scope = s.scope;

  }

  return toReturn;
}

interface AuthPaths {
  root: string,
  delete: string,
  callback: string
  session: string
}

export default class Utils {
  config:Options
  isOnline: boolean;
  paths:AuthPaths
  cache: Session[] | false
  memoryArgs?:  MemorySessionStorage
  constructor(config:Options) {
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
    }
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

  checkDevIntercept(shop: string | false):false | Session  {
    if (!shop) {
      return false;
    }
    if (isDev() && this.config.dev) {
      let needle = typeof this.config.dev.host == 'string' ? this.config.dev.host :  'localhost' ;
      if (shop == needle && 'session' in this.config.dev) {
        // Logger(`Mocking shop ${needle}' as ${this.config.dev.session.shop}`, 'info');
        return convertToSession(this.config.dev.session);
      }
    }
    return false;
  }


  configureSessionStorage(options: Options):CustomSessionStorage | undefined {
  if (typeof options.storage == 'object') {
    if (options.storage.customSessionStorage) {
      return options.storage.customSessionStorage;
    } else if (options.storage.path) {
      return pathedStorage(options.storage.path)
    }
  }  else {
    //Otherwise, we just load from app memory
    return undefined
  }
}



  async setupContext() {
    let config:ContextParams = {
    	API_KEY        : this.config.env.apiKey,
      API_SECRET_KEY : this.config.env.secret,
      SCOPES         : [this.config.env.scopes],
      HOST_NAME      : this.config.env.host.replace(/https:\/\//, ''),
      API_VERSION    : this.config.env.apiVersion,
      IS_EMBEDDED_APP: this.config.env.embedded,
      /* This is done via a session */
    }

    const SessionStorage = this.configureSessionStorage(this.config)
    if (SessionStorage) {
      Logger('Initialized custom session from config.', 'info');
      config.SESSION_STORAGE= this.configureSessionStorage(this.config)
    } else if (!this.config.storage?.disableMemory) {
      Logger('Initialized default memory storage.', 'info');
      const customMemoryStorage = await this.setupMemory();
      config.SESSION_STORAGE = customMemoryStorage
    } else {
      Logger('No session storage provided. Must provide a customSessionStorage, a path, or enable memory storage (default)', 'error');
      return false;
    }

    Shopify.Context.initialize(config)
    return true;
  }

  async setupMemory():Promise<undefined | CustomSessionStorage> {
    var storage:Session[] = [];
    const self = this;
    if (this.config.storage?.disableMemory ) {
      Logger('Did not init memory storage: Memory storage disabled in options', 'info');
      return;
    }

    if (this.config.callbacks.memory.init) {
      const value = await tryCallback<SessionInterface[]>(this.config.callbacks.memory.init);
      if (value) {
        storage = (value);
      }
      // return;
    }


    async function loader(id):Promise<SessionInterface | undefined> {
      if (storage) {
        return storage.find(s=> s.id == id);
      }
      return;
    }

    async function storer(session: SessionInterface): Promise<boolean> {
      if (storage) {
        storage[session.shop] = session
      }
      let callbackFinished = true;
      if (self.config.callbacks.shop.save) {
        callbackFinished = await tryCallback<boolean>(self.config.callbacks.shop.save, session);
      }
      if (callbackFinished) {
        return true;
      }
      return false;
    }

    async function deleter(id: string): Promise<boolean> {
      let deleted = false;
      if (storage ) {
        const index = storage.findIndex(v=> v.id == id);
        if (storage && index) {

          storage.splice(index, 1);
          deleted = true;
        }
      }

       let callbackFinished = true;
      if (self.config.callbacks.shop.delete) {
        callbackFinished = await tryCallback<boolean>(self.config.callbacks.shop.delete, id);
      }
      if (callbackFinished && deleted) {
        return true;
      }
      return false;
    }

    return new Shopify.Session.CustomSessionStorage(storer,  loader, deleter);
  }

  getOfflineSession() {

  }

  getCachedSession(req:IncomingMessage, res:ServerResponse):Session | undefined {
    const id = Shopify.Auth.getCurrentSessionId(req, res);
    if (id && this.cache) {
      const item = this.cache.find(v=>v.id == id);
      if (item && item.isActive()) {
        return item;
      }
    }
    return;
  }

  async loadSession(req:IncomingMessage, res:ServerResponse): Promise<Session | undefined>{
    const cachedSession = this.getCachedSession(req, res)
    if (cachedSession) {
      return cachedSession;
    }
    let url = getUrlFromReq(req);
    let sessionLoaded = await Shopify.Utils.loadCurrentSession(req, res, this.isOnline)
    if (url) {
      const devIntercept = this.checkDevIntercept(url.hostname);
      if (devIntercept) { return devIntercept }
    }
    return sessionLoaded;
  }
  async saveSession(session:Session) : Promise<boolean> {
    let callbackFinished = true;
    if (this.config.callbacks.shop.save) {
      callbackFinished = await tryCallback<boolean>(this.config.callbacks.shop.save, session);
    }
    const saved = await Shopify.Context.SESSION_STORAGE.storeSession(session)
    if (saved  && callbackFinished) {
      return true
    }
    return false;
  }

  async deleteSession(req:IncomingMessage, res:ServerResponse):Promise<boolean> {
    let callbackFinished = true;
    if (this.config.callbacks.shop.delete) {
      if (req.headers.host) {
        callbackFinished = await tryCallback<boolean>(this.config.callbacks.shop.delete, req.headers.host )
      }
    }
    const deleted = await Shopify.Utils.deleteCurrentSession(req, res, )
    if (callbackFinished && deleted) {
      return true;
    }
    return false;
  }

  async handleCallback(req:IncomingMessage, res:ServerResponse) {
    Logger('Starting callback for auth process.', "info")
    const params = checkCallbackParams(getUrlFromReq(req));
    if (!params) {
      res.writeHead(500).end('Error: malformed query returned to Shopify OAuth Callback. Missing a required parameter from { code, timestamp, state, shop }')
      return false;
    }

    try {
      await Shopify.Auth.validateAuthCallback(req, res, params )
      res.writeHead(300, {'Location': getFinalUrl(this.config, params)}).end();
    } catch(e:any) {
      const msg = 'Error: Could not validate auth query: ' + (e instanceof Error ? e.message : '');
      Logger(msg, 'error')
      res.writeHead(500).end(msg );

    }
  }

  async startAuth(req:IncomingMessage, res: ServerResponse):Promise<boolean> {
    const shop = getShop(getUrlFromReq(req));
    if (!shop) {
      //No shop found, so we're failing loudly.
      res.writeHead(500);
      res.end(`Failed to complete OAuth process: no shop name found`);
      return false;
    }
    try {
    //Use Shopify.Auth to create res url and then redirect.

    const authRoute = await Shopify.Auth.beginAuth(req, res, shop, this.paths.callback, this.isOnline );
    res.writeHead(302, {Location: authRoute});
    res.end();
    return false;
  } catch(e:any) {
      const msg = 'Error: Could not validate auth query: ' + (e instanceof Error ? e.message : '');
      Logger(msg, 'error')
      res.writeHead(500).end(msg );
      return false ;
    }
  }
}