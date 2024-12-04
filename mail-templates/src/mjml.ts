import { resolve } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { MJMLParsingOptions } from 'mjml-core';
import { createFolder, htmlFromTemplate } from './utils';

export const run = (
  sourceDir: string,
  targetDir: string,
  data?: Record<string, any>,
  createSubfolder = false
) => {
  const items = readdirSync(sourceDir, { withFileTypes: true })
    .filter((item) => item.isFile())
    .filter((item) => item.name.endsWith('.mjml'))
    .map((item) => item.name)
    .map((item) => item.split('.')[0]);

  for (const item of items) {
    const template = readFileSync(resolve(sourceDir, item + '.mjml'), 'utf-8');

    const options: MJMLParsingOptions = {
      filePath: sourceDir,
    };
    const message = htmlFromTemplate(template, data?.[item], options);
    createFolder(targetDir);
    let filename = resolve(targetDir, item + '.html');
    if (createSubfolder) {
      createFolder(targetDir + '/' + item + '/' + item);
      filename = resolve(targetDir, item, item, item + '.html');
    }
    writeFileSync(filename, message);
  }
};
