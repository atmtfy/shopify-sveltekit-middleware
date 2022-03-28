import Logger from "./logger";
let ACTIVE_SHOPIFY_SHOPS = {};
async function tryCallback(callback, params) {
    if (typeof callback == 'function') {
        try {
            const response = await callback(params);
            return response;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    else {
        return true;
    }
}
async function saveShopToMemory(params, callback) {
    Logger(`Saving shop ${params.shop} to memory`, "info");
    ACTIVE_SHOPIFY_SHOPS[params.shop] = params;
    const resp = await tryCallback(callback, params);
    return resp;
}
async function removeShopFromMemory(shopName, callback) {
    delete ACTIVE_SHOPIFY_SHOPS[shopName];
    const resp = await tryCallback(callback, shopName);
    return resp;
}
async function findShopInMemory(shopName, callback) {
    const resp = await tryCallback(callback, shopName);
    if (!resp) {
        return ACTIVE_SHOPIFY_SHOPS[shopName];
    }
    return resp;
}
async function syncMemoryToDb(callback) {
    const resp = await tryCallback(callback);
    if (!resp) {
        return ACTIVE_SHOPIFY_SHOPS;
    }
    return resp;
}
export { saveShopToMemory, removeShopFromMemory, findShopInMemory, syncMemoryToDb };
//# sourceMappingURL=shopStorage.js.map