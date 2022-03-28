
import type { Connect, ViteDevServer, ServerHook } from 'vite';
import type { Options } from "./config";
import middleware from "./middleware";


interface Plugin {
  name:string,
  configureServer?: ServerHook
}
/**
 * @param options Plugin options passed in the vite config.
 */
/**
 * Creates the vite plugin:
 */
export default function createPlugin(options:Options  | null = {}):Plugin {
  return {
    name: 'Sveltekit Shopify Middleware',
    async configureServer(server:ViteDevServer){
      const md = await middleware(options);
      if (md) {
        server.middlewares.use(md);
      }
    }
  }
}


export type { Options };