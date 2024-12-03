import mjml2html from "mjml"
import Handlebars from "handlebars"
import { registerHelpers } from "./hbshelpers/registerHelpers.ts"
import { iOrderInfo } from "./iOrderInfo.ts"

function handlebarsErrorMJML(error: any) {
   return `
     <mjml><mj-body><mj-section><mj-column>
       <mj-text>Handlebars encountered an error:</mj-text>
       <mj-text>${error.message}</mj-text>
     </mj-column></mj-section></mj-body></mjml>
   `;
 }


export const htmlFromTemplate = (template: string, data: iOrderInfo, options?: any): string => {
   
   function processMJMLTemplate(mjml: any) {
      try {
         const hbarsTemplate = hbs.compile(mjml);
         const compiledTemplate = hbarsTemplate(data);
         return compiledTemplate;
       } catch (e) {
         console.error(e);
         return handlebarsErrorMJML(e)
       }
    }
   options.preprocessors = [processMJMLTemplate]
   const hbs = Handlebars
   registerHelpers(hbs)
   const output = mjml2html(template, options)
   
   if (output.errors && output.errors.length) console.log(output.errors)
   return output.html
}

