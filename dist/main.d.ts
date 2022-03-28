import type { ServerHook } from 'vite';
import type { Options } from "./config";
interface Plugin {
    name: string;
    configureServer?: ServerHook;
}
export default function createPlugin(options?: Options | null): Plugin;
export type { Options };
//# sourceMappingURL=main.d.ts.map