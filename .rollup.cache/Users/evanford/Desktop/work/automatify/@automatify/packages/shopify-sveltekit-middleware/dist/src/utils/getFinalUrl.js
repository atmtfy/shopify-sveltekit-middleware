export default function getFinalUrl(options, params) {
    if (options.rootPath) {
        return `${options.rootPath}/?host=${params.host}&shop=${params.shop}`;
    }
    return `/?host=${params.host}&shop=${params.shop}`;
}
//# sourceMappingURL=getFinalUrl.js.map