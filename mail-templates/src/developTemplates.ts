import { resolve } from 'path';
import { run } from './mjml';

const getAllRunner = async () => {
  const mjmlFolder = resolve('src', 'templateengine', 'mjml');
  const testDataDir = resolve('src', 'templateengine', 'testdata');
  const targetDir = resolve('build', 'templates');
  run(mjmlFolder, targetDir, testDataDir);
};

getAllRunner().catch((e) => console.error(e));
