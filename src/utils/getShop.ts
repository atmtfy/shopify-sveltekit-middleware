export default function getShop(url:URL) {
  if (url.searchParams.get('shop')) {
    return url.searchParams.get('shop');
  } else {
    return false;
  }
}