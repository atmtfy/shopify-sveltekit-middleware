import { Shopify } from "@shopify/shopify-api";
import { removeShopFromMemory } from "./shopStorage";
;
import { getShop, getFinalUrl } from "./utils";
import Logger from "./logger";
async function setupDeleteWebhook(shop, session) {
    const response = await Shopify.Webhooks.Registry.register({
        shop,
        accessToken: session.accessToken,
        path: '/webhooks',
        topic: 'APP_UNINSTALLED',
        webhookHandler: async (topic, shop, body) => {
            removeShopFromMemory(shop);
        }
    });
    return response;
}
function handleShopifyError(response, e) {
    Logger(e, "error");
    response.writeHead(500);
    response.end(`${e.name}:\n Failed to complete OAuth process: ${e.message}`);
    return false;
}
const startAuth = async (url, request, response, callbackPath) => {
    const shop = getShop(url);
    if (!shop) {
        response.writeHead(500);
        response.end(`Failed to complete OAuth process: no shop name found`);
        return false;
    }
    try {
        const authRoute = await Shopify.Auth.beginAuth(request, response, shop, callbackPath, false);
        response.writeHead(302, { Location: authRoute });
        response.end();
        return false;
    }
    catch (e) {
        handleShopifyError(response, e);
        return false;
    }
};
function checkCallbackParams(url) {
    if (url.searchParams.has('shop') && url.searchParams.has('code') && url.searchParams.has('timestamp') && url.searchParams.has('state')) {
        let toReturn = {
            code: url.searchParams.get('code'),
            shop: url.searchParams.get('shop'),
            state: url.searchParams.get('state'),
            timestamp: url.searchParams.get('timestamp'),
        };
        if (url.searchParams.has('hmac')) {
            toReturn.hmac = url.searchParams.get('hmac');
        }
        if (url.searchParams.has('host')) {
            toReturn.host = url.searchParams.get('host');
        }
        return toReturn;
    }
    else {
        return false;
    }
}
const handleCallback = async (url, request, response, config) => {
    Logger('Starting callback for auth process.', "info");
    const params = checkCallbackParams(url);
    if (!params) {
        response.writeHead(500);
        response.end('Error: malformed query returned to Shopify OAuth Callback. Missing a required parameter from { code, timestamp, state, shop }');
        return false;
    }
    try {
        await Shopify.Auth.validateAuthCallback(request, response, params);
        response.writeHead(302, { location: getFinalUrl(config, params) });
        response.end();
        return false;
    }
    catch (e) {
        handleShopifyError(response, e);
        return false;
    }
};
export { startAuth, handleCallback };
//# sourceMappingURL=handler.js.map