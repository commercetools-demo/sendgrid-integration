import {
  existsSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { resolve } from 'path';
import {
  createTemplate,
  createVersion,
  getTemplates,
  getVersion,
  Template as APITemplate,
  updateVersion,
  Version as APIVersion,
} from './sendGridWrapper';
import { createFolder, writeJsonFile } from './utils';

type Version = { id: string; remote: Date; local: Date; html: Date };
type Template = { id: string; name: string; versions: Array<Version> };

type StatusFile = {
  templates: Array<Template>;
};

let i = 1;
let foundUntitledVersion = false;

const retrieveUniqueName = (name: string) => {
  let nameToUse = name;
  if (nameToUse === 'Untitled Version') {
    if (!foundUntitledVersion) {
      foundUntitledVersion = true;
    } else {
      nameToUse = nameToUse + `(${i})`;
      i++;
    }
  }
  return nameToUse;
};

const storeVersionLocally = async (
  templateId: string,
  versionId: string,
  path: string,
  versionInStore: Version
) => {
  const version = await getVersion(templateId, versionId);
  const filenameAPIResponse = resolve(path, version.name + '.json');
  const filenameHTML = resolve(path, version.name + '.html');
  writeFileSync(filenameAPIResponse, JSON.stringify(version, undefined, 2));
  if (version.html_content) {
    writeFileSync(filenameHTML, version.html_content);
    const { mtime } = statSync(filenameHTML);
    versionInStore.html = mtime;
  }
  const { mtime } = statSync(filenameAPIResponse);
  versionInStore.local = mtime;
  versionInStore.remote = new Date(version.updated_at);
};

const checkUpdatedStatus = (
  versionInStore: Version,
  version: APIVersion,
  versionPath: string
) => {
  //check if updated locally
  const { mtime: localVersionOfVersionEditDate } = statSync(
    versionPath + '/' + version.name + '.json'
  );
  const { mtime: localVersionOfHTML } = statSync(
    versionPath + '/' + version.name + '.html'
  );
  let updatedLocal = false;
  let updatedRemote = false;
  //check if updated locally
  if (localVersionOfVersionEditDate > new Date(versionInStore.local)) {
    updatedLocal = true;
  }
  if (localVersionOfHTML > new Date(versionInStore.html)) {
    updatedLocal = true;
  }
  //check if updated remotely
  if (new Date(version.updated_at) > new Date(versionInStore.remote)) {
    updatedRemote = true;
  }
  return { updatedLocal, updatedRemote };
};

async function versionDoesNotExistLocally(
  template: APITemplate,
  version: APIVersion,
  versionPath: string,
  templateToStore: Template
) {
  //new
  const versionInStore: Version = {
    id: version.id,
    remote: new Date(),
    local: new Date(),
    html: new Date(),
  };
  await storeVersionLocally(
    template.id,
    version.id,
    versionPath,
    versionInStore
  );
  templateToStore.versions.push(versionInStore);
}

async function versionExistsLocally(
  versionPath: string,
  version: APIVersion,
  template: APITemplate,
  versionInStore: Version,
  nameToUse: string,
  foundUntitledVersion: boolean,
  path: string
) {
  //maybe someone delete the local version
  if (!existsSync(versionPath + '/' + version.name + '.json')) {
    await storeVersionLocally(
      template.id,
      version.id,
      versionPath,
      versionInStore
    );
  }
  const { updatedLocal, updatedRemote } = checkUpdatedStatus(
    versionInStore,
    version,
    versionPath
  );
  //not yet sure what to do if both got updated
  if (updatedLocal && updatedRemote) {
    console.log('Remote and Local file has changed. Not sure what to do');
  }
  if (updatedLocal) {
    //local is newer --> update version
    const data: APIVersion = JSON.parse(
      readFileSync(versionPath + '/' + version.name + '.json', 'utf-8')
    );
    if (existsSync(versionPath + '/' + version.name + '.html')) {
      data.html_content = readFileSync(
        versionPath + '/' + version.name + '.html',
        'utf-8'
      );
    }
    const updatedVersion = await updateVersion(template.id, version.id, data);
    // since the name might have changed, check
    if (updatedVersion.name !== nameToUse) {
      //delete file
      unlinkSync(versionPath + '/' + version.name + '.json');
      unlinkSync(versionPath + '/' + version.name + '.html');
      //delete folder
      rmdirSync(versionPath);
      //and recreate it

      const nameToUse = retrieveUniqueName(updatedVersion.name);
      versionPath = resolve(path, nameToUse);
      createFolder(versionPath);
    }
    // this is just convenience, the data is all loaded, but we need the file creation date as well
    await storeVersionLocally(
      template.id,
      version.id,
      versionPath,
      versionInStore
    );
  }
  if (updatedRemote) {
    console.log('Remote is newer --> Update');
    await storeVersionLocally(
      template.id,
      version.id,
      versionPath,
      versionInStore
    );
  }
  return foundUntitledVersion;
}

const getAllRunner = async () => {
  const statusFilePath = resolve('templates', 'status.json');
  let status: StatusFile = { templates: [] };
  if (existsSync(statusFilePath)) {
    status = JSON.parse(readFileSync(statusFilePath, 'utf-8'));
  }
  const templates = await getTemplates();

  console.log(`Found ${templates.length} templates`);
  //go through all remote templates
  for (const template of templates) {
    console.log(`  Sync Template ${template.name}`);
    //local path to store templates
    const path = resolve('templates', template.name);

    //config of template and all versions to compare to see if updates are required
    let templateToStore: Template = {
      id: template.id,
      name: template.name,
      versions: [],
    };

    //is there an entry in the existing synced templates
    const isExisting = status.templates.find(
      (entry) => entry.id === template.id
    );

    //if the folder does not exist, create it
    createFolder(path);

    //if there is no entry in the local status file, add one
    if (!isExisting) {
      status.templates.push(templateToStore);
    } else {
      //or use it
      templateToStore = isExisting;
    }

    if (template.versions.length === 0) {
      console.log(`      No Remote Version`);
      const items = readdirSync(path, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => ({
          path: path + '/' + item.name + '/' + item.name + '.html',
          name: item.name,
        }))
        .filter((fileName) => existsSync(fileName.path))
        .map((fileName) => ({
          file: readFileSync(fileName.path, 'utf-8'),
          name: fileName.name,
        }));
      for (const item of items) {
        await createVersion(template.id, {
          template_id: template.id,
          active: 1,
          name: item.name,
          html_content: item.file,
          generate_plain_content: false,
          subject: '',
        });
      }
    } else {
      console.log(
        `    Found ${template.versions.length} versions for template (${template.name})`
      );

      for (const version of template.versions) {
        console.log(`      Syncing Version ${version.name}`);
        //check if there is a local entry in status.json
        const versionInStore = templateToStore.versions.find(
          (v) => v.id === version.id
        );
        //calculate unique name
        const nameToUse = retrieveUniqueName(version.name);

        //create storage path
        const versionPath = resolve(path, nameToUse);
        createFolder(versionPath);

        //Already stored in status.json
        if (versionInStore) {
          foundUntitledVersion = await versionExistsLocally(
            versionPath,
            version,
            template,
            versionInStore,
            nameToUse,
            foundUntitledVersion,
            path
          );
        } else {
          await versionDoesNotExistLocally(
            template,
            version,
            versionPath,
            templateToStore
          );
        }
      }
      //Resetting counters
      i = 1;
      foundUntitledVersion = false;
    }
  }

  const templateNames = templates.map((template) => template.name);
  const items = readdirSync('templates', { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name)
    .filter((item) => templateNames.indexOf(item) < 0);

  for (const folder of items) {
    if (existsSync(resolve('templates', folder, folder, folder + '.html'))) {
      const template = await createTemplate(folder);
      const version = await createVersion(template.id, {
        template_id: template.id,
        active: 1,
        name: folder,
        html_content: readFileSync(
          resolve('templates', folder, folder, folder + '.html'),
          'utf-8'
        ),
        generate_plain_content: false,
        subject: folder,
      });
      const versionInStore: Version = {
        id: version.id,
        remote: new Date(),
        local: new Date(),
        html: new Date(),
      };
      await storeVersionLocally(
        template.id,
        version.id,
        resolve('templates', folder, folder),
        versionInStore
      );
      status.templates.push({
        id: template.id,
        name: template.name,
        versions: [versionInStore],
      });
    }
  }

  writeJsonFile(status, 'templates', 'status');
};

getAllRunner()
  .then(() => process.exit())
  .catch((e) => console.error(e));
