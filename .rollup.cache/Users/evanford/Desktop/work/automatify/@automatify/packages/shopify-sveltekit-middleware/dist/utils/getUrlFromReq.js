export default function getUrlFromReq(req) {
    return new URL(req.url, `http://${req.headers.host}`);
}
//# sourceMappingURL=getUrlFromReq.js.map