import { Shopify } from '@shopify/shopify-api';
import fs from 'fs';
import { dirname } from 'path';
import Logger from './logger';
const SESSION_FILE = '.storage/sessions.json';
const preFsCheck = (path = SESSION_FILE) => {
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
};
export default function generateSessionStorageFromPath(sessionFile = SESSION_FILE) {
    preFsCheck(sessionFile);
    const storeCallback = async (session) => {
        let sessions = {};
        if (fs.existsSync(sessionFile)) {
            const json = fs.readFileSync(sessionFile).toString();
            sessions = JSON.parse(json || '{}');
        }
        sessions[session.id] = session;
        fs.writeFileSync(sessionFile, JSON.stringify(sessions, null, '\t'));
        return true;
    };
    const loadCallback = async (id) => {
        if (fs.existsSync(sessionFile)) {
            const json = fs.readFileSync(sessionFile).toString();
            const sessions = JSON.parse(json || '{}');
            return sessions[id] || undefined;
        }
        return undefined;
    };
    const deleteCallback = async (id) => {
        let sessions = {};
        if (fs.existsSync(sessionFile)) {
            const json = fs.readFileSync(sessionFile).toString();
            sessions = JSON.parse(json || '{}');
        }
        delete sessions[id];
        fs.writeFileSync(sessionFile, JSON.stringify(sessions, null, '\t'));
        return true;
    };
    return new Shopify.Session.CustomSessionStorage(storeCallback, loadCallback, deleteCallback);
}
//# sourceMappingURL=sessionStorage.js.map