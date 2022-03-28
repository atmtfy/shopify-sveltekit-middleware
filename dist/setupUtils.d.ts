/// <reference types="node" />
import { Session, CustomSessionStorage, MemorySessionStorage } from "@shopify/shopify-api/dist/auth/session";
import type { Options } from "./config";
import type { IncomingMessage, ServerResponse } from "http";
interface AuthPaths {
    root: string;
    delete: string;
    callback: string;
    session: string;
}
export default class Utils {
    config: Options;
    isOnline: boolean;
    paths: AuthPaths;
    cache: Session[] | false;
    memoryArgs?: MemorySessionStorage;
    constructor(config: Options);
    init(): Promise<void>;
    setupPaths(): void;
    checkDevIntercept(shop: string | false): false | Session;
    configureSessionStorage(options: Options): CustomSessionStorage | undefined;
    setupContext(): Promise<boolean>;
    setupMemory(): Promise<undefined | CustomSessionStorage>;
    getOfflineSession(): void;
    getCachedSession(req: IncomingMessage, res: ServerResponse): Session | undefined;
    loadSession(req: IncomingMessage, res: ServerResponse): Promise<Session | undefined>;
    saveSession(session: Session): Promise<boolean>;
    deleteSession(req: IncomingMessage, res: ServerResponse): Promise<boolean>;
    handleCallback(req: IncomingMessage, res: ServerResponse): Promise<boolean>;
    startAuth(req: IncomingMessage, res: ServerResponse): Promise<boolean>;
}
export {};
//# sourceMappingURL=setupUtils.d.ts.map