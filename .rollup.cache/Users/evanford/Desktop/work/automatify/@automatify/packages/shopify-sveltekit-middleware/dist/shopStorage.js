import Logger from "./logger";
import { tryCallback } from "./utils";
import { shops, usingMemory, shopsValue } from './memory';
async function saveShopToMemory(params, callback) {
    if (usingMemory()) {
        shops.update(val => {
            let final = val;
            final[params.shop] = params;
            return final;
        });
    }
    const resp = await tryCallback(callback, params);
    return resp;
}
async function removeShopFromMemory(shopName, callback) {
    if (usingMemory()) {
        shops.update(val => {
            let final = val;
            if (shopName in final) {
                delete final[shopName];
            }
            return final;
        });
    }
    const resp = await tryCallback(callback, shopName);
    return resp;
}
async function findShopInMemory(shopName, callback) {
    Logger(`Finding shop ${shopName} in memory`, "info");
    if (usingMemory()) {
        const s = shopsValue();
        if (shopName in s) {
            return s[shopName];
        }
    }
    const resp = await tryCallback(callback, shopName);
    if (usingMemory && resp) {
        shops.update(val => {
            let toReturn = val;
            val[shopName] = resp;
            return toReturn;
        });
    }
    return resp;
}
export { saveShopToMemory, removeShopFromMemory, findShopInMemory };
//# sourceMappingURL=shopStorage.js.map