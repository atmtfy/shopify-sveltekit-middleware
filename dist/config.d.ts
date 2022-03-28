import type { Session } from '@shopify/shopify-api/dist/auth/session';
import type { CustomSessionStorage } from "@shopify/shopify-api/dist/auth/session";
import { ApiVersion, SessionInterface } from '@shopify/shopify-api';
interface Options {
    env?: ShopifyEnv;
    dev?: DevEnv;
    auth?: AuthUrls;
    host?: string;
    storage?: {
        disableMemory?: boolean;
        path?: string;
        customSessionStorage?: CustomSessionStorage;
    };
    callbacks?: {
        shop?: {
            save?: (s: SessionInterface) => boolean;
            delete?: (name: string) => boolean;
        };
        memory?: {
            init?: () => {
                [key: string]: Session;
            };
            cleanup?: () => void;
        };
    };
}
interface DevEnv {
    host?: string;
    session?: SessionInterface;
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
    isOnline: boolean;
    apiVersion: ApiVersion;
}
export declare function loadConfig(options?: Options | null): Promise<Options | false>;
export declare function validateConfig(config: any): any;
export type { Options, ShopifyEnv, AuthUrls };
//# sourceMappingURL=config.d.ts.map