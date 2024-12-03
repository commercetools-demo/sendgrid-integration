import { htmlFromTemplate } from "./htmlfromtemplate.ts"
import { cwd } from 'node:process';
console.log(`Current directory: ${cwd()}`);
import  order  from "./order.json" with { type: "json" }
import { iOrderInfo } from "./iOrderInfo.ts" 

const options = {
   filePath: cwd() + "/templateengine/mjml"
}

const data: iOrderInfo = {
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
   order: order
}

const html = (): BodyInit => {
   const template = Deno.readTextFileSync("templateengine/mjml/order.mjml")
   return htmlFromTemplate(template, data, options)
} 

Deno.serve((_req) => new Response(html(), {headers: {"Content-Type": "text/html"}}));