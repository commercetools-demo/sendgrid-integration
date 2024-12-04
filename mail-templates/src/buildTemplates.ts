import { resolve } from 'path';
import { run } from './mjml';

const getAllRunner = async () => {
  const mjmlFolder = resolve('src', 'templateengine', 'mjml');
  const testDataDir = resolve('src', 'templateengine', 'testdata');
  const targetDir = resolve('templates');
  run(mjmlFolder, targetDir, testDataDir, true);
};

getAllRunner().catch((e) => console.error(e));
