export default function isDev() {
    if (import.meta && 'env' in import.meta && 'mode' in import.meta.env && import.meta.env.mode == 'DEVELOPMENT') {
        return true;
    }
    else if (process && process.env && typeof process.env.NODE_ENV == 'string' && process.env.NODE_ENV.toUpperCase() == 'DEVELOPMENT') {
        return true;
    }
}
//# sourceMappingURL=isDev.js.map