import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

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
