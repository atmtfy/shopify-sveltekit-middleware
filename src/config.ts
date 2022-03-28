
import path from 'path';
import fs from 'fs';
import type { Session } from '@shopify/shopify-api/dist/auth/session';
import * as url from 'url';
import type {  CustomSessionStorage } from "@shopify/shopify-api/dist/auth/session"

import  {ApiVersion, SessionInterface} from '@shopify/shopify-api';

interface Options {
  env?: ShopifyEnv ,
  dev?: DevEnv,
  auth?:  AuthUrls ,
  host?: string,
  storage?: {
    disableMemory?: boolean,
    path?: string
    customSessionStorage?: CustomSessionStorage
  }
  callbacks?: {
    shop?: {
      save?: (s: SessionInterface)=> boolean
      delete?: (name: string)=> boolean
      // find?: (name: string)=> SessionInterface
    }
    memory?: {
      init?: () => {[key:string]: Session}
      cleanup?: ()=>void
    }
  }
}

interface DevEnv {
  host?:string
  session?:SessionInterface
}

interface AuthUrls {
    root: string,
    callback :string,
    delete: string,
  }

interface ShopifyEnv {
  apiKey: string,
  secret: string,
  scopes: string,
  host: string,
  embedded: boolean,
  isOnline: boolean,
  apiVersion: ApiVersion
}

export async function loadConfig(options:Options | null = null):Promise<Options|false> {
  let validated:false|Options = false;

	const config_file = path.join(process.cwd(), 'shopify.config.js');
  if (options == null || typeof options != 'object') {
    if (!fs.existsSync('shopify.config.js')) {
      console.error('Missing shopify.config.js — cannot init middleware');
      return;
    }
    else {
      const config = await import(url.pathToFileURL(config_file).href);
      validated = validateConfig(config.default);
    }

  } else {
    validated = validateConfig(options);
  }

  if (validated) {

    return integrateDefaults(validated);
  } else {
    return false;
  }
}


function integrateDefaults(config: Options):Options|false {
  let env = checkEnv(config.env? config.env : false);
  if (env) {
    return Object.assign( {env, auth: '/auth' } , config);
  } else {
    console.warn('Shopify middleware must contain an \'env\' property, defined either in shopify.config.js or in svelte.config.js.\'')
    return false;
  }


}
/**
 * @description Error handling for shopify environment variables, as well as setting sensible defaults.
 */
function checkEnv(env: any):ShopifyEnv|false{
  if (typeof env != 'object') {
    console.error("Error with Shopify setup: options.env must be an object. Please correct your sveltekit config and restart your app.")
    return false;
  }

  /**
   *
   * @description creates sensible defaults for the 'embedded' and 'apiVersion' props
  */
  const envValues = {...{
    embedded: true,
    apiVersion: ApiVersion.October21
  }, ...env }

  let hasError = false;
  /* All required props are required as strings */
  const requiredProps = ['apiKey', 'host', 'scopes', 'host'];
  requiredProps.forEach(prop=>{
    if (typeof env[prop]  != 'string') {
      console.error(`Error with shopify setup: options.env must contain a valid string for ${prop}. Please correct your sveltekit config and restart your app.`)
      hasError = true;
    }
  })

  if (envValues.apiVersion !in ApiVersion) {
    console.error ("Invalid Shopify APi Version")
    hasError = true;
  }

  return !hasError ? envValues : false;
}
export function validateConfig(config:any) {
  if (typeof config !== 'object') {
		throw new Error(
			'svelte.config.js must have a configuration object as its default export. See https://kit.svelte.dev/docs/configuration'
		);
	}
	return config
}


export type { Options, ShopifyEnv, AuthUrls }