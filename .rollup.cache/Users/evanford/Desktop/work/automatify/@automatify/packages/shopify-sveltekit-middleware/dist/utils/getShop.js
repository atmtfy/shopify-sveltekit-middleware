export default function getShop(url) {
    if (url.searchParams.get('shop')) {
        return url.searchParams.get('shop');
    }
    else {
        return false;
    }
}
//# sourceMappingURL=getShop.js.map