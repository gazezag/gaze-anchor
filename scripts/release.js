const { resolve } = require('path');
const { baseRunner, npmRunner, gitRunner, getArgs } = require('./utils');
const packageJSON = require('../package.json');

const rootPath = resolve(__dirname, '..');

const moveFiles = async () => {
  await baseRunner('cp', ['package.json', 'README.md', 'README-zh.md', 'dist'], rootPath);
};

const getUpdatedVersion = () => {
  // const [mainVersion, subVersion, phaseVersion] = packageJSON.version.split('.');
  // return `${mainVersion}.${subVersion}.${+phaseVersion + 1}`;
  return packageJSON.version;
};

const updateVersion = async () => {
  const [kind] = getArgs();
  await npmRunner('version', kind.slice(2), rootPath);
};

const commit = async () => {
  await gitRunner('add', '-a');
  await gitRunner('commit', ['-m', `updated version: ${getUpdatedVersion()}`]);
  await gitRunner('push', ['github', 'master']);
};

const publish = async () => {
  await baseRunner('cd', 'dist');
  await npmRunner('run', 'publish');
};

const release = async () => {
  await moveFiles();
  await updateVersion();
  await commit();
  await publish();
};

release();
