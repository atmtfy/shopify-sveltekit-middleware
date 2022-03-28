import type { ServerResponse } from "http";
import type { Connect } from "vite";
import type { Options } from "./config";
declare const startAuth: (url: URL, request: Connect.IncomingMessage, response: ServerResponse, callbackPath: string) => Promise<boolean>;
declare const handleCallback: (url: URL, request: Connect.IncomingMessage, response: ServerResponse, options: Options) => Promise<boolean>;
declare const handleDelete: (url: any, request: any, response: any, options: any) => Promise<boolean>;
export { startAuth, handleCallback, handleDelete };
//# sourceMappingURL=handler.d.ts.map