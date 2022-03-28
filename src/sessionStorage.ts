import { Shopify } from '@shopify/shopify-api';
import type { SessionInterface } from '@shopify/shopify-api';
import type { Session } from '@shopify/shopify-api/dist/auth/session';
import * as fs from 'fs';
import { preFsCheck } from './utils';
// Saves the sesson to JSON
// On prod save the session to the DB and use encryption

const SESSION_FILE = '.storage/sessions.json';

export default function generateSessionStorageFromPath(sessionFile: string = SESSION_FILE) {
  preFsCheck(sessionFile);
  const storeCallback = async (session: Session):Promise<boolean> => {
    let sessions = {};
    if (fs.existsSync(sessionFile)) {
      const json = fs.readFileSync(sessionFile).toString();
      sessions = JSON.parse(json || '{}');
    }
    sessions[session.id] = session;

    fs.writeFileSync(sessionFile, JSON.stringify(sessions, null, '\t'));

    return true;
  };

  const loadCallback = async (id: string):Promise<SessionInterface | Record<string, unknown> | undefined> => {
    if (fs.existsSync(sessionFile)) {
      const json = fs.readFileSync(sessionFile).toString();
      const sessions = JSON.parse(json || '{}');
      return sessions[id] || undefined;
    }
    return undefined;
  };

  const deleteCallback = async (id):Promise<boolean> => {
    let sessions = {};
    if (fs.existsSync(sessionFile)) {
      const json = fs.readFileSync(sessionFile).toString();
      sessions = JSON.parse(json || '{}');
    }

    delete sessions[id];

    fs.writeFileSync(sessionFile, JSON.stringify(sessions, null, '\t'));

    return true;
  };

  return new Shopify.Session.CustomSessionStorage(
	storeCallback,
	loadCallback,
	deleteCallback
);

}