import { Shopify } from '@shopify/shopify-api';
import fs from 'fs';
import { preFsCheck } from './utils';
const SESSION_FILE = '.storage/sessions.json';
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