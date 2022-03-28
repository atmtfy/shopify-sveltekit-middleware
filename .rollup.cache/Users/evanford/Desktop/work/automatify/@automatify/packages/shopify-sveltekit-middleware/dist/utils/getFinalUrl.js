export default function getFinalUrl(options, params) {
    if (options.host) {
        return `${options.host}/?host=${params.host}&shop=${params.shop}`;
    }
    return `/?host=${params.host}&shop=${params.shop}`;
}
//# sourceMappingURL=getFinalUrl.js.map