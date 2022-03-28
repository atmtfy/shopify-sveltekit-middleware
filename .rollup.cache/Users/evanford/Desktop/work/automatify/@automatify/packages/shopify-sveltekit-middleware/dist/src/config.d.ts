import type { CustomSessionStorage } from "@shopify/shopify-api/dist/auth/session";
import { ApiVersion } from '@shopify/shopify-api';
interface Options {
    env?: ShopifyEnv;
    auth?: string | AuthUrls;
    rootPath?: string;
    sessionStorage?: {
        path?: string;
        customSessionStorage?: CustomSessionStorage;
    };
    callbacks?: {
        shop?: {
            save?: () => boolean;
            delete?: () => boolean;
            update?: () => boolean;
        };
    };
}
interface AuthUrls {
    root: string;
    callback: string;
    delete: string;
}
interface ShopifyEnv {
    apiKey: string;
    secret: string;
    scopes: string;
    host: string;
    embedded: boolean;
    apiVersion: ApiVersion;
}
export declare function loadConfig(options?: Options | null): Promise<Options | false>;
export declare function validateConfig(config: any): any;
export type { Options, ShopifyEnv, AuthUrls };
//# sourceMappingURL=config.d.ts.map