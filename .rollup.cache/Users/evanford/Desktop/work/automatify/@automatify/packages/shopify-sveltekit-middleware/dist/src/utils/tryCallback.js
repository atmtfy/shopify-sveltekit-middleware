export default async function tryCallback(callback, params) {
    if (typeof callback == 'function') {
        try {
            const response = await callback(params);
            return response;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    else {
        return true;
    }
}
//# sourceMappingURL=tryCallback.js.map