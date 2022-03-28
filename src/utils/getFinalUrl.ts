import type { Options } from "../config";
import type { AuthQuery } from "@shopify/shopify-api";
export default function getFinalUrl(options: Options, params: AuthQuery):string {
  if(options.host ) {
    return `${options.host}/?host=${params.host}&shop=${params.shop}`;
  }
  return `/?host=${params.host}&shop=${params.shop}`
}
