import mjml2html from "mjml"
import Handlebars from "handlebars"
import { registerHelpers } from "./hbshelpers/registerHelpers.ts"
import { messageObject } from "./iMessageObjects.ts"


function handlebarsErrorMJML(error: any) {
   return `
     <mjml><mj-body><mj-section><mj-column>
       <mj-text>Handlebars encountered an error:</mj-text>
       <mj-text>${error.message}</mj-text>
     </mj-column></mj-section></mj-body></mjml>
   `;
 }

/**
 * converts a mjml template and data to html
 * @param template the mjml template
 * @param data the data that needs to be inserted into this template
 * @param options the various options for mjml
 * @returns html 
 */
export const htmlFromTemplate = (template: string, data: messageObject, options?: any): string => {
   
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

