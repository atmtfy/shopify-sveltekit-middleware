import type { Options } from "../config";
import Logger from "./logger";

export default function findHook(options:Options, hook: string, args:any = null):null| (()=>any) {
  const split = hook.split('.');

  if (split.length != 2 || !options.callbacks) {
    return;
  }
  if (!options.callbacks[split[0]]) {
    return;
  } else {
  }
  const found = options.callbacks[split[0]][split[1]]
  if (typeof found == "function") {
    return found;
  } else {
    Logger(`Callback ${hook} is not function`, 'warning');
    return null;
  }
}
