
import Logger from "./logger";
export default async function tryCallback<T>(callback: any, params?: any):Promise<T | false> {
  //Safety function for callbacks from user params.
  if (typeof callback == 'function') {
    try {
      return await callback(params);
    } catch(e) {
      Logger(e, 'error');
      return false;
    }
  }
 else if ( typeof callback == 'object' && callback instanceof Promise ) {
   //Odd scenario, if the function is already called and the promise is in memory
  return callback;
  }


  return false;
}