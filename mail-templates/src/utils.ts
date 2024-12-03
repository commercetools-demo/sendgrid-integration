import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import mjml2html from 'mjml';
import Handlebars from 'handlebars';
import { MJMLParsingOptions } from 'mjml-core';

export const writeJsonFile = (
  result: object | undefined,
  absolutePath: string,
  fileName: string
) => {
  if (result) {
    createFolder(absolutePath);
    const filename = resolve(absolutePath, fileName + '.json');
    writeFileSync(filename, JSON.stringify(result, undefined, 2));
  }
};

export const createFolder = (absolutePath: string) => {
  if (!existsSync(absolutePath)) {
    mkdirSync(absolutePath, { recursive: true });
  }
};

function handlebarsErrorMJML(error: any) {
  return `
     <mjml><mj-body><mj-section><mj-column>
       <mj-text>Handlebars encountered an error:</mj-text>
       <mj-text>${error.message}</mj-text>
     </mj-column></mj-section></mj-body></mjml>
   `;
}

export const htmlFromTemplate = (
  template: string,
  data: Record<string, any>,
  options: MJMLParsingOptions
): string => {
  function processMJMLTemplate(mjml: any) {
    try {
      const hbarsTemplate = hbs.compile<Record<string, any>>(mjml);
      return hbarsTemplate(data);
    } catch (e) {
      console.error(e);
      return handlebarsErrorMJML(e);
    }
  }
  options.preprocessors = [processMJMLTemplate];
  const hbs = Handlebars;
  const output = mjml2html(template, options);

  if (output.errors && output.errors.length) console.log(output.errors);
  return output.html;
};
