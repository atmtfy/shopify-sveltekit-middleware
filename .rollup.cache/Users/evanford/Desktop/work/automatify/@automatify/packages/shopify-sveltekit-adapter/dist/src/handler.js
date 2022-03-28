import { Shopify } from "@shopify/shopify-api";
import { removeShopFromMemory, saveShopToMemory } from "./shopStorage";
import Logger from "./logger";
var CallbackNamespaces;
(function (CallbackNamespaces) {
    CallbackNamespaces["SHOP"] = "shop";
})(CallbackNamespaces || (CallbackNamespaces = {}));
function getShop(url) {
    if (url.searchParams.get('shop')) {
        return url.searchParams.get('shop');
    }
    else {
        return false;
    }
}
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
}
function handleShopifyError(response, e) {
    Logger(e, "error");
    response.writeHead(500);
    response.end(`${e.name}:\n Failed to complete OAuth process: ${e.message}`);
    return false;
}
const startAuth = async (url, request, response, callbackPath) => {
    Logger('Starting auth process.', "info");
    const shop = getShop(url);
    if (!shop) {
        console.log('Could not authorize: no shop name found');
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
function findHook(options, hook, args) {
    const split = hook.split('.');
    if (split.length != 2 || !options.callbacks) {
        return;
    }
    if (!options.callbacks[split[0]]) {
        return;
    }
    else {
    }
    const found = options.callbacks[split[0]][split[1]];
    if (typeof found == "function") {
        return found;
    }
    else {
        return null;
    }
}
function getFinalUrl(options, params) {
    if (options.rootPath) {
        return `${options.rootPath}/?host=${params.host}&shop=${params.shop}`;
    }
    return `/?host=${params.host}&shop=${params.shop}`;
}
const handleCallback = async (url, request, response, options) => {
    Logger('Starting callback for auth process.', "info");
    const params = checkCallbackParams(url);
    if (!params) {
        response.writeHead(500);
        response.end('Error: malformed query returned to Shopify OAuth Callback. Missing a required parameter from { code, timestamp, state, shop }');
        return false;
    }
    try {
        await Shopify.Auth.validateAuthCallback(request, response, params);
        const session = await Shopify.Utils.loadCurrentSession(request, response, false);
        await saveShopToMemory(session, findHook(options, 'shop.save', session));
        const webhookResponse = setupDeleteWebhook(params.shop, session);
        response.writeHead(302, { location: getFinalUrl(options, params) });
        response.end();
        return false;
    }
    catch (e) {
        handleShopifyError(response, e);
        return false;
    }
};
const handleDelete = async (url, request, response, options) => {
    await Shopify.Utils.deleteCurrentSession(request, response);
    const shopName = url.searchParams.get('shop');
    if (shopName) {
        return await removeShopFromMemory(shopName, findHook(options, "shop.delete", shopName));
    }
    else {
        return false;
    }
};
export { startAuth, handleCallback, handleDelete };
//# sourceMappingURL=handler.js.map