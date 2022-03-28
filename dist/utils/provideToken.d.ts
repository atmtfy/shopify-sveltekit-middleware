import type { Options } from "../config";
export declare let ACCESS_TOKENS: {
    [key: string]: string;
};
export default function provideToken(shop: string, config: Options): Promise<{
    shop: string;
    accessToken: string;
} | false>;
//# sourceMappingURL=provideToken.d.ts.map