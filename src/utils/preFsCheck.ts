
import fs from 'fs';
import { dirname } from 'path';
import Logger from './logger';
/**
 * Checks for filesystem access/functionality to provide safe interaction with the fs for memory functions
 * @param path path of session file
 */
export default function preFsCheck (path:string ) {
  try {

    if (fs.existsSync(path)) {

    } else {
      fs.mkdir(dirname(path), {recursive: true}, function (err) {
        if (err) return console.error(err);
        fs.writeFile(path, '{}', ()=> { Logger("Generated session storage file at "  + path, "info") });
      });
    }
  } catch(e) {
    console.error(e);
  }
}