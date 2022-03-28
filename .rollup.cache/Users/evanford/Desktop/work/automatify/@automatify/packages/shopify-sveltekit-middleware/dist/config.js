import path from 'path';
import fs from 'fs';
import * as url from 'url';
import { ApiVersion } from '@shopify/shopify-api';
export async function loadConfig(options = null) {
    let validated = false;
    const config_file = path.join(process.cwd(), 'shopify.config.js');
    if (options == null || typeof options != 'object') {
        if (!fs.existsSync('shopify.config.js')) {
            console.error('Missing shopify.config.js — cannot init middleware');
            return;
        }
        else {
            const config = await import(url.pathToFileURL(config_file).href);
            validated = validateConfig(config.default);
        }
    }
    else {
        validated = validateConfig(options);
    }
    if (validated) {
        return integrateDefaults(validated);
    }
    else {
        return false;
    }
}
function integrateDefaults(config) {
    let env = checkEnv(config.env ? config.env : false);
    if (env) {
        return Object.assign({ env, auth: '/auth' }, config);
    }
    else {
        console.warn('Shopify middleware must contain an \'env\' property, defined either in shopify.config.js or in svelte.config.js.\'');
        return false;
    }
}
function checkEnv(env) {
    if (typeof env != 'object') {
        console.error("Error with Shopify setup: options.env must be an object. Please correct your sveltekit config and restart your app.");
        return false;
    }
    const envValues = { ...{
            embedded: true,
            apiVersion: ApiVersion.October21
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
export function validateConfig(config) {
    if (typeof config !== 'object') {
        throw new Error('svelte.config.js must have a configuration object as its default export. See https://kit.svelte.dev/docs/configuration');
    }
    return config;
}
//# sourceMappingURL=config.js.map