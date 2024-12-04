import { resolve } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { MJMLParsingOptions } from 'mjml-core';
import { createFolder, htmlFromTemplate, writeJsonFile } from './utils';

export const run = (
  sourceDir: string,
  targetDir: string,
  testDataDir: string,
  createForSync = false
) => {
  const items = readdirSync(sourceDir, { withFileTypes: true })
    .filter((item) => item.isFile())
    .filter((item) => item.name.endsWith('.mjml'))
    .map((item) => item.name)
    .map((item) => item.split('.')[0]);

  for (const item of items) {
    const template = readFileSync(resolve(sourceDir, item + '.mjml'), 'utf-8');
    const testData = JSON.parse(
      readFileSync(resolve(testDataDir, item + '.json'), 'utf-8')
    );

    const options: MJMLParsingOptions = {
      filePath: sourceDir,
    };
    const message = htmlFromTemplate(
      template,
      testData,
      options,
      !createForSync
    );
    createFolder(targetDir);
    let filename = resolve(targetDir, item + '.html');
    if (createForSync) {
      createFolder(targetDir + '/' + item + '/' + item);
      filename = resolve(targetDir, item, item, item + '.html');
      if (testData) {
        writeJsonFile(
          testData,
          resolve(targetDir, item, item),
          item + '-testdata'
        );
      }
    }
    writeFileSync(filename, message);
  }
};
