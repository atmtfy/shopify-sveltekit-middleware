/// <reference types="node" />
import type { Connect } from 'vite';
import type * as http from 'http';
declare type MiddlewareFunction = (req: Connect.IncomingMessage, res: http.ServerResponse, next: () => any) => void;
declare type MiddlewareBuilder = (Options: any) => Promise<MiddlewareFunction>;
declare const buildMiddleware: MiddlewareBuilder;
export default buildMiddleware;
//# sourceMappingURL=middleware.d.ts.map