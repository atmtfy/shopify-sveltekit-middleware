import { tryCallback, Logger } from "./utils";
import { writable } from "svelte/store";
let shops = writable({});
let memoryEnabled = writable(false);
function usingMemory() {
    let isTrue = false;
    const unsub = memoryEnabled.subscribe(v => isTrue = v);
    unsub();
    return isTrue;
}
function shopsValue() {
    let toReturn = {};
    const unsub = shops.subscribe(v => toReturn = v);
    unsub();
    return toReturn;
}
async function setup(config) {
    if (config.storage?.disableMemory) {
        Logger('Did not init memory storage: Memory storage disabled in options', 'info');
        return;
    }
    memoryEnabled.set(true);
    if (config.callbacks?.memory?.init) {
        const value = await tryCallback(config.callbacks.memory.init);
        if (value) {
            shops.set(value);
        }
        Logger('Initialized memory storage.', 'info');
        return;
    }
    Logger('No memory.init callback, skipping.', 'info');
}
async function cleanup(config) {
    if (usingMemory()) {
        shops.set({});
        Logger('Successfully cleaned memory', 'info');
        return;
    }
    Logger('Could not clean up memory: memory storage disabled in options.', 'info');
}
export { shops, memoryEnabled, usingMemory, shopsValue, setup, cleanup };
//# sourceMappingURL=memory.js.map