import middleware from "./middleware";
export default function createPlugin(options = {}) {
    return {
        name: 'Sveltekit Shopify Middleware',
        async configureServer(server) {
            const md = await middleware(options);
            if (md) {
                server.middlewares.use(md);
            }
        }
    };
}
//# sourceMappingURL=main.js.map