import fs from 'fs';
import { dirname } from 'path';
import Logger from '../logger';
export default function preFsCheck(path) {
    try {
        if (fs.existsSync(path)) {
        }
        else {
            fs.mkdir(dirname(path), { recursive: true }, function (err) {
                if (err)
                    return console.error(err);
                fs.writeFile(path, '{}', () => { Logger("Generated session storage file at " + path, "info"); });
            });
        }
    }
    catch (e) {
        console.error(e);
    }
}
//# sourceMappingURL=preFsCheck.js.map