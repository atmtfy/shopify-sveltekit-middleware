import type { IncomingMessage } from "http";

export default function getUrlFromReq(req:IncomingMessage) {
   return new URL(req.url, `http://${req.headers.host}`)
}