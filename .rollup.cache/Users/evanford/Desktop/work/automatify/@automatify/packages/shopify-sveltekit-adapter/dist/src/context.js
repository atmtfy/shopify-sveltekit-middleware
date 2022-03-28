import { Shopify, ApiVersion } from '@shopify/shopify-api';
import pathedStorage from "./sessionStorage";
function checkEnv(env) {
    if (typeof env != 'object') {
        console.error("Error with Shopify setup: options.env must be an object. Please correct your sveltekit config and restart your app.");
        return false;
    }
    const envValues = { ...{
            embedded: true,
            apiVersion: ApiVersion[0]
        }, ...env };
    let hasError = false;
    const requiredProps = ['apiKey', 'host', 'scopes', 'host'];
    requiredProps.forEach(prop => {
        if (typeof env[prop] != 'string') {
            console.error(`Error with shopify setup: options.env must contain a valid string for ${prop}. Please correct your sveltekit config and restart your app.`);
            hasError = true;
        }
    });
    if (envValues.apiVersion in ApiVersion) {
        console.error("Invalid Shopify APi Version");
        hasError = true;
    }
    return !hasError ? envValues : false;
}
function configureSessionStorage(options) {
    if (typeof options.sessionStorage == 'object') {
        if (options.sessionStorage.customSessionStorage) {
            return options.sessionStorage.customSessionStorage;
        }
        else if (options.sessionStorage.path) {
            return pathedStorage(options.sessionStorage.path);
        }
    }
    else {
        return pathedStorage();
    }
}
export default function setupContext(options, where = "Default") {
    const env = checkEnv(options.env);
    if (!env) {
        throw new Error("Shopify Environment Variables not correctly defined in plugin config.");
    }
    Shopify.Context.initialize({
        API_KEY: env.apiKey,
        API_SECRET_KEY: env.secret,
        SCOPES: [env.scopes],
        HOST_NAME: env.host.replace(/https:\/\//, ''),
        API_VERSION: env.apiVersion,
        IS_EMBEDDED_APP: env.embedded,
        SESSION_STORAGE: configureSessionStorage(options)
    });
}
//# sourceMappingURL=context.js.map