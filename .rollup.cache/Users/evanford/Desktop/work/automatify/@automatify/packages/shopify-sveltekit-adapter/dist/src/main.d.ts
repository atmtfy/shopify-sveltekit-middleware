import type { ViteDevServer } from 'vite';
import type { Options } from "./context";
export default function createPlugin(options?: Options): {
    name: string;
    configureServer(server: ViteDevServer): () => void;
};
export { Options };
//# sourceMappingURL=main.d.ts.map