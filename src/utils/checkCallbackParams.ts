import type { AuthQuery } from "@shopify/shopify-api"

export default function checkCallbackParams(url?:URL): AuthQuery| false {
  //Check if the url has the correct callback parameters from Shopify
  if (url && url.searchParams.has('shop') && url.searchParams.has('code') && url.searchParams.has('timestamp') && url.searchParams.has('state') ) {
    let toReturn: AuthQuery =  {
      code: url.searchParams.get('code'),
      shop: url.searchParams.get('shop'),
      state: url.searchParams.get('state'),
      timestamp: url.searchParams.get('timestamp'),
    }
    if (url.searchParams.has('hmac')) { toReturn.hmac = url.searchParams.get('hmac')}
    if (url.searchParams.has('host')) { toReturn.host = url.searchParams.get('host')}
    return toReturn
  } else {

    return false;
  }
}