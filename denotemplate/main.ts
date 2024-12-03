import { iEnveloppe } from "./smtp/iEnveloppe.ts"
import { mailtrapconfig } from "./config/mailtrapconfig.ts"
import { smtpSender } from "./smtp/smtpSender.ts"
import  order  from "./templateengine/order.json" with { type: "json" }
import { cwd } from 'node:process';
import { htmlFromTemplate } from "./templateengine/htmlfromtemplate.ts"
import { Order } from "@commercetoolsdemo/sdk"
import { messageObject } from "./templateengine/iMessageObjects.ts"


if (import.meta.main) {

  const options = {
    filePath: cwd() + "/templateengine/mjml"
  }

  const data: messageObject = {
    locale: "de-DE",
    company: {
       name: "commercetools",
       logo: "https://commercetools.com/_build/images/logos/commercetools-logo-2024.svg",
       address: {
          streetName: "Mainroad",
          streetNumber: "66",
          postalCode: "1234 BB",
          city: "Downtown",
          country: "United States of something"
       }
    },
    order: order as Order
 }

 const template = Deno.readTextFileSync("templateengine/mjml/order.mjml")


  const msg: iEnveloppe = {
    from: {name: "test 1", address: "testone@commercetools.com"},
    to: [{name: "test 1 to", address: "testoneto@commercetools.com"}],
    subject: `Orderconfirmation ${order.orderNumber}`,
    text: "text1 text",
    html: htmlFromTemplate(template, data, options)
  }
  const result = await smtpSender(mailtrapconfig, msg)
  console.log(result)
}
