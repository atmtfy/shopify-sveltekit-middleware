import { blue, bgYellow, bgRed, bgGreen, bgBlue, green, red, yellow, bold } from "colorette";
export default function Logger(msg, level) {
    if (typeof msg != "string") {
        console.log(bold(bgRed('Shopify Middleware Error:')) + ' ' + red(msg.message));
        console.trace();
    }
    else {
        if (level == "error") {
            console.log(bold(bgRed('Shopify Middleware Error:')) + ' ' + red(msg));
        }
        else if (level == 'setup') {
            console.log(bold(bgBlue('Shopify Middleware:')) + " " + blue(msg));
        }
        else {
            switch (level) {
                case "info":
                    console.log(bold(bgGreen('Shopify Middleware:')) + " " + green(msg));
                    break;
                case "warning":
                    console.log(bold(bgYellow('Shopify Middleware Warning:')) + " " + yellow(msg));
                    break;
                default:
                    break;
            }
        }
    }
}
//# sourceMappingURL=logger.js.map