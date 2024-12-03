export const resolveHBSTemplate = (partialname: string): string => {
   try {
     const mjmltemplate = Deno.readTextFileSync(`templateengine/mjml/${partialname.toLowerCase()}.mjml`)
     return mjmltemplate
   }
   catch (_error) {
     return `could not find partial ${partialname}`
   }
 }