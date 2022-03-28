# Shopify Sveltekit Adapter

A WIP adapter to use Sveltekit with shopify while using the Vite middleware to run necessary authentication hooks.

## How it Works
Shopify apps need server-side authorization. This is a challenge for SSR/flat apps made in svelte-kit. How can you do this? [More about why.](#why)


## What it does

- Automatically redirects `/auth` requests to Shopify's Auth endpoint with the correct parameters to get user authorization.
- It then handles the `/callback` response from Shopify – storing session variables and continuing to the site. This does a lot under the hood: initiating session storage, webhooks, and storing host and scope for later if we need to reauthorize.
- Provides an `authedFetch` helper function that allows for API-side authenticated fetches in api routes (note, not recommended to authedFetch from the frontend. Rather, just use unauthenticated fetch and shopify cookies will authenticate the request on *.myshopify.com domains).

## Installation

Use a package manager to install the plugin.

`````sh
npm i -D @atmtfy/shopify-sveltekit-middleware #or
pnpm i -D @atmtfy/shopify-sveltekit-middleware #or
yarn add -D @atmtfy/shopify-sveltekit-middleware
`````

# Usage

This middleware functions both as a vite server plugin and an express/node middleware.

Both are powered by a shared config file at the root of your project: `shopify.config.js`. You can alternately provide a config object to the init functions.

Vite setup is for the development server, where node setup allows you to use this plugin with a router (Express is the only one supported for now).

## Vite
Add shopify-sveltekit-middleware to your `svelte.config.js` config like so:

````js
//#svelte.config.js

import Shopify from '@atmtfy/shopify-sveltekit-middleware';

//Other imports

/** @type {import('@sveltejs/kit').Config} */
const config = {
  ...

  kit: {
    ...

    vite: {
      ...

      plugins: [
        Shopify(/** {  Config object, or use shopify.config.js } */)
      ]
    }
  }
}
`````

If successful, you should see a message on vite/sveltekit startup showing 'Initializing Shopify Middleware'.

## Node.js / Express

Use the `@atmtfy/shopify-sveltekit-middleware/node` entry point. Then  use `await middleware()` to wait for the middleware to load your `shopify.config.js`

````ts
//#index.js

import middleware from '@atmtfy/shopify-sveltekit-middleware/node';
import handler from './build/handler' // Your sveltekit app handler
import express from express();

const app = express();
app.use(await middleware()); //Await matters. Loading config is async

///... Other express middleware or functions

app.use(handler) // Use svelte-kit handler

app.listen(__PORT__)
`````

# Configuration

The middleware and plugin accept the same config object. Configuration is most effective through the `shopify.config.js` file. It can also be passed directly to these functions.



## Basic Configuration

There is one required config properties: `config.env`. It contains your shopify app dashboard variables (api key, api secret, scopes, and secret). It's recommended to use environment variables for these sensitive values.


`````ts
// #shopify.config.js

dotenv.config();

export default config {

  env:  { // The env property is required.
    apiKey: process.env.SHOPIFY_API_KEY
    secret: process.env.SHOPIFY_API_SECRET
    scope: process.env.SHOPIFY_SCOPE // (e.g. 'write_products')
    host: process.env.SHOPIFY_HOST //Your app's host URL (usually in .env)

    /** There are additional optional env variables */

    embedded: true, //Optional. Defaults to true.
    apiVersion: Shopify.ApiVersion.October21  //Optional. Defaults to '2021-10'.
  }
}

`````

# Advanced Configuration

For intellisense, you can use `/** @type {import('@atmtfy/shopify-sveltekit-middleware').Options }*/` to help build your config.

## Dev Mocking

It's a good idea to set up a mock token and host for your local development environment.

`````ts
// #shopify.config.js

config {
  ...
  dev: {
    shop: _______.myshopify.com
    accessToken: shpat_somegobbeldygook2022
    host: localhost, //Optional needle string, default to localhost.
  }
}
`````

## Session Storage

Here's an example storing sessions in a database:

`````ts
// #shopify.config.js
import {store, load, delete} from './myCustomSessionStorage'
import { Shopify } from "@shopify/shopify-api";

config {
  ...
  storage: {
    disableMemory: true //Default: false. Saves sessions in memory
    path: 'path/to/storage' //Default: null
    customSessionStorage: new Shopify.Session.CustomSessionStorage(
      store,
      load,
      delete
    )
  }

`````

Next up, storing sessions! When the `/callback` function is finished, the middleware will try to save the Session provided (type: `SessionInterface`). There are three options build into session storage in this middleware:

1. `disableMemory:boolean`: By default, the middleware will save sessions to memory. If you're in production or have a huge number of sessions, you may want to disable this. Defaults to false.

2. `path:string` : You can enter an absolute or relative path here to enable filesystem caching of sessions. Make sure your app/middleware has permission to write files. Default to null

3. `customSessionStorage: Shopify.Session.SessionStorage`:  This is the preferred method, as it allows you to use a database of your choosing to save, load, and delete sessions.

### **customSessionStorage**

This is the preferred method of storing Shopify's sessions. This should should be a function with three arguments:

1. `storeSession: (SessionInterface)=>Promise<boolean>`: Stores your session in a DB or some other method. Should return true/false on success/failure. Should be async.

2. `loadSession:(string) => Promise<SessionInterface>`: Should find your session by **id** (not shop name).Should be async.

3. `deleteSession:(string) =>  Promise<boolean>`: Should delete a session by id, and return true/false on success/failure.

## Callbacks

Callbacks allow you to initialize memory, set up shops in a database and delete shops from a database. (More may come late if useful).

`````ts
  // #shopify.config.js

  import {saveShop, findShop,  deleteShop, getAllSessions, cleanupSessions } from "./db" //example import

  export default {
    // ... Other config stuff

    callbacks: {
      shop: {
        save: saveShop, // (SessionInterface)=> boolean
        delete: deleteShop, //(string)=> boolean
      }
      memory: {
        init: getAllSessions // () => {[key:string]: SessionInterface}
      }
    }
  }

`````

These functions work predictably to either replace or supplement behavior in the auth process.

### shop.save:
Runs when the `/callback` route callback has finished, and passes on the function. Useful for creating a new shop in your database and storing things outside of the session.

### shop.delete
Runs alongside the `/delete` route. Does what it says: delete shop by shop name

### memory.init
Load all your sessions from your DB! No arguments, and expects a keyed object of Sessioninterfaces. The key should be the shop name. For instance:
`````ts
return {
  "example.myshopify.com" : {
    shop: "example.myshopify.com",
    state: "192oldjb';apopjse"
    ...
  }
}
`````

# Why middleware at all?

There are many options for oAuth with sveltekit, whether with Shopify or another app.

One option is to use something like [svelte-shopify-auth](https://github.com/unlocomqx/sveltekit-shopify-auth). This is simple and works well, but requires integrating the middleware code directly into the codebase of your app. It also is not very 'pluggable' (can you copy and paste your handler.js function between apps?) Lastly, it may struggle with certain shopify fetches that must be done from CORS-safe origins (either the *.myshopify.com domain or a backend client.)

I prefer to use middleware to intercept Shopify auth requests and pass the necessary data on to your Sveltekit app, and then get on with the app itself? This allows session storage / authorization to be done at the server level. This is a philosophy choice to keep my Sveltekit apps focused on front-end functionality rather than auth and session storage.

This same middleware with one shared config works both in dev (Vite's server) and in production (in node.js currently, cloudflare workers to come!) added benefits of being more pluggable and divorcing your auth storage from your app code!


