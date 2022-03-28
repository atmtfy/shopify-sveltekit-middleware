import Logger from "../logger";
import { findShopInMemory } from "../shopStorage";
export let ACCESS_TOKENS = {};
export default async function provideToken(shop, config) {
    if (shop in ACCESS_TOKENS) {
        return { shop, accessToken: ACCESS_TOKENS[shop] };
    }
    else {
        if (config.dev) {
            let needle = typeof config.dev.host == 'string' ? config.dev.host : 'localhost';
            if (shop == needle) {
                if ('shop' in config.dev && 'accessToken' in config.dev) {
                    Logger(`Mocking shop ${needle}' as ${config.dev.shop}`, 'info');
                    return { shop: config.dev.shop, accessToken: config.dev.accessToken };
                }
            }
        }
        try {
            const session = await findShopInMemory(shop, config.callbacks?.shop?.find);
            if (session) {
                return { shop, accessToken: session.accessToken };
            }
            return false;
        }
        catch (e) {
            return false;
        }
    }
}
//# sourceMappingURL=provideToken.js.map