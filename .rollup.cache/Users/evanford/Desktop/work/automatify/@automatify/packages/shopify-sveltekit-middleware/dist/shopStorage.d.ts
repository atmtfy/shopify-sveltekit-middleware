import type { SessionInterface } from "@shopify/shopify-api";
declare type MemoryShopSaverCallback = (string: any) => boolean | false | undefined | null;
declare type MemoryShopDeleterCallback = (string: any) => boolean | false | undefined | null;
declare type MemoryShopFinderCallback = (string: any) => false | SessionInterface;
declare function saveShopToMemory(params: SessionInterface, callback?: MemoryShopSaverCallback): Promise<boolean>;
declare function removeShopFromMemory(shopName: string, callback?: MemoryShopDeleterCallback): Promise<boolean>;
declare function findShopInMemory(shopName: string, callback?: MemoryShopFinderCallback): Promise<SessionInterface | false>;
export { saveShopToMemory, removeShopFromMemory, findShopInMemory };
//# sourceMappingURL=shopStorage.d.ts.map