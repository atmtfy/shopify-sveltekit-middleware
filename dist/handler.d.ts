import type { ServerResponse } from "http";
import type { Connect } from "vite";
import type { Options } from "./config";
declare const startAuth: (url: URL, request: Connect.IncomingMessage, response: ServerResponse, callbackPath: string) => Promise<boolean>;
declare const handleCallback: (url: URL, request: Connect.IncomingMessage, response: ServerResponse, config: Options) => Promise<boolean>;
export { startAuth, handleCallback };
//# sourceMappingURL=handler.d.ts.map