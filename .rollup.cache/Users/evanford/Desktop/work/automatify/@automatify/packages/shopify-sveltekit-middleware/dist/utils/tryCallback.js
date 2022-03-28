import Logger from "./logger";
export default async function tryCallback(callback, params) {
    if (typeof callback == 'function') {
        try {
            return await callback(params);
        }
        catch (e) {
            Logger(e, 'error');
            return false;
        }
    }
    else if (typeof callback == 'object' && callback instanceof Promise) {
        return callback;
    }
    return false;
}
//# sourceMappingURL=tryCallback.js.map