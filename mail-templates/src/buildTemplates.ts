import { resolve } from 'path';
import { run } from './mjml';

const getAllRunner = async () => {
  const mjmlFolder = resolve('src', 'templateengine', 'mjml');
  const targetDir = resolve('templates');
  run(mjmlFolder, targetDir, undefined, true);
};

getAllRunner().catch((e) => console.error(e));
