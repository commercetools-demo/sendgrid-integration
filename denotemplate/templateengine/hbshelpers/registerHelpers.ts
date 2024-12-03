
import { dateHelper } from "./date.ts"
import { imgurl } from "./imgurl.ts"

import { formatMoney, getPriceValue } from "./price.ts"

export const registerHelpers = (hbs: any, ): void => {
   hbs.registerHelper("Date", dateHelper)
   hbs.registerHelper("FormatMoney", formatMoney)
   hbs.registerHelper("getPriceValue", getPriceValue)
   hbs.registerHelper("imgUrl", imgurl)
}
