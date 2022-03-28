import type { SessionInterface } from "@shopify/shopify-api";
declare function saveShopToMemory(params: SessionInterface, callback?: MemoryShopSaverCallback): Promise<boolean>;
declare function removeShopFromMemory(shopName: string, callback?: MemoryShopDeleterCallback): Promise<boolean>;
declare function findShopInMemory(shopName: string, callback?: MemoryShopFinderCallback): Promise<RequiredStoreVars | false>;
declare function syncMemoryToDb(callback?: MemorySyncCallback): Promise<StoresInMemory>;
export { saveShopToMemory, removeShopFromMemory, findShopInMemory, syncMemoryToDb };
//# sourceMappingURL=shopStorage.d.ts.map