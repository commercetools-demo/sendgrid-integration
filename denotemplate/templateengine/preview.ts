import { htmlFromTemplate } from "./htmlfromtemplate.ts"
import { cwd } from 'node:process';
import  order  from "./order.json" with { type: "json" }
import { Order } from "@commercetoolsdemo/sdk"
import { messageObject } from "./iMessageObjects.ts"

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

const html = (): BodyInit => {
   const template = Deno.readTextFileSync("templateengine/mjml/order.mjml") // reading from file for now
   return htmlFromTemplate(template, data, options)
} 

Deno.serve((_req) => new Response(html(), {headers: {"Content-Type": "text/html"}}));