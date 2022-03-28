import type { CustomSessionStorage } from "@shopify/shopify-api/dist/auth/session";
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
export type { Options };
export default function setupContext(options: Options, where?: string): void;
//# sourceMappingURL=context.d.ts.map