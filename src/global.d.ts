/// <reference types="vite" />
/// <reference path="@shopify/shopify-api" />

import type { SessionInterface } from "@shopify/shopify-api"


interface ShopifyEnv {
  apiKey: string,
  secret: string,
  scopes: string,
  host: string,
  embedded: boolean,
  apiVersion: ApiVersion
}


type RequiredStoreVars = {
  shop: string,
  state?: string,
  scope: string
  host?: string
}

// env.d.ts
interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_SHOPIFY_API_KEY?: string,
  readonly VITE_SHOPIFY_API_SECRET?: string,
  readonly VITE_SHOPIFY_API_VERSION?: string,
  readonly VITE_SHOPIFY_SCOPES?: string,
  readonly MODE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
