import { bgRed, bgGreen, green, gray, red, yellow, bold } from "colorette"

type Level = "info" | "error" | "warning" | "setup"

import isDev from "./isDev";
export default function Logger(msg:string | Error, level: Level):void {
  if (typeof msg != "string") {
    console.log(bold(bgRed('Shopify Middleware Error:')) + ' ' + red(msg.message) )
    console.trace()
  }
  else {
    if (level == "error") {
      console.log(bold(bgRed('Shopify Middleware Error:')) + ' ' + red(msg) )
    } else if (level == 'setup') {
      console.log(bold(bgGreen('Shopify Middleware:')) + " " + green(msg))
    } else if (isDev())  {
      switch (level) {
        case "info" :
            console.log(bold(gray('Shopify Middleware:')) + " " + gray(msg))
        break;
        case "warning":
          console.log(bold(yellow('Shopify Middleware:')) + " " + yellow(msg));
        break;
        default:
        break;
      }
    }
  }
}