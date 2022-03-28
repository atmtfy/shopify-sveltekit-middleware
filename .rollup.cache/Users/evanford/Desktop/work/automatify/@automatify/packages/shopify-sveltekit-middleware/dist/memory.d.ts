import type { SessionInterface } from "@shopify/shopify-api";
import type { Options } from "./config";
import type { Writable } from "svelte/store";
interface ShopsInMemory {
    [key: string]: SessionInterface;
}
declare let shops: Writable<ShopsInMemory>;
declare let memoryEnabled: Writable<boolean>;
declare function usingMemory(): boolean;
declare function shopsValue(): ShopsInMemory;
declare function setup(config: Options): Promise<void>;
declare function cleanup(config: Options): Promise<void>;
export { shops, memoryEnabled, usingMemory, shopsValue, setup, cleanup };
export type { ShopsInMemory };
//# sourceMappingURL=memory.d.ts.map