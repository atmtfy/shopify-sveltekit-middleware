import { Shopify } from '@shopify/shopify-api';
import pathedStorage from "./sessionStorage";
function configureSessionStorage(options) {
    if (typeof options.storage == 'object') {
        if (options.storage.customSessionStorage) {
            return options.storage.customSessionStorage;
        }
        else if (options.storage.path) {
            return pathedStorage(options.storage.path);
        }
    }
    else {
        return undefined;
    }
}
export default function setupContext(options) {
    let config = {
        API_KEY: options.env.apiKey,
        API_SECRET_KEY: options.env.secret,
        SCOPES: [options.env.scopes],
        HOST_NAME: options.env.host.replace(/https:\/\//, ''),
        API_VERSION: options.env.apiVersion,
        IS_EMBEDDED_APP: options.env.embedded,
    };
    const SessionStorage = configureSessionStorage(options);
    if (SessionStorage) {
        config.SESSION_STORAGE = configureSessionStorage(options);
    }
    Shopify.Context.initialize(config);
}
//# sourceMappingURL=contextBO.js.map