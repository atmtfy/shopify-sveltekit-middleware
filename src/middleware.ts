import type {  Connect } from 'vite';
import { Logger, getUrlFromReq } from "./utils";
import type { Options } from "./config";
import type * as http from 'http';
import { loadConfig } from "./config";
import SetupUtils from "./setupUtils";

type MiddlewareFunction = (req:Connect.IncomingMessage, res: http.ServerResponse, next:()=>any ) => void
type MiddlewareBuilder = (Options)=>Promise<MiddlewareFunction>
const buildMiddleware:MiddlewareBuilder= async (options) => {
  let config = await loadConfig(options);
  if (!config) {
    console.error("Failed to instantiate shopify middleware: no config loaded.")
    return (req, res, next) => {next()}
  }
  Logger("Initializing Shopify Middleware", "setup")

  const Utils = new SetupUtils(config);
  await Utils.init()

  if (!config) {
    Logger('Failed to instantiate middleware: No config found.', 'error');
    return (req, res, next)=> {
      next()
    }
  }

  return async (req:Connect.IncomingMessage, res: http.ServerResponse, next:()=>any)=>{
    // First, grab the origin URL request and build a Node URL
    const url = getUrlFromReq(req);

    const session = await Utils.loadSession(req, res);
    // Wait for shouldContinue before calling next() function
    let shouldContinue = true;
    //Defaults to doing nothing if we get no url or no matches.


    if ( req.url ) {
      switch (url.pathname) {
        case Utils.paths.root:
          shouldContinue = await Utils.startAuth(req,res);
        break;
        case Utils.paths.session:
          const resp = await Utils.loadSession(req, res);
          if (resp) {
            res.end(JSON.stringify(resp))
          } else {
            res.end(JSON.stringify({token: false, shop: url.hostname}))
          }
          shouldContinue = false;
        break;
        case Utils.paths.callback:
          shouldContinue = await Utils.handleCallback(req, res);
        break;
        case Utils.paths.delete:
          shouldContinue = await Utils.deleteSession( req, res );
        break;
        default:
          if (!session) {
            res.writeHead(300, {'Location': Utils.paths.root}).end();
          }
        break;
      }
    }
    if (shouldContinue) {
      next()
    } else {
      res.end();
    }
  }
}

export default buildMiddleware