const { resolve } = require('path');
const { baseRunner, getArgs } = require('./utils');
const packageJSON = require('../package.json');

const rootPath = resolve(__dirname, '..');
const distPath = resolve(__dirname, '../dist');

const moveFiles = async () => {
  await baseRunner('cp', ['package.json', 'README.md', 'README-zh.md', 'dist'], rootPath);
};

const getUpdatedVersion = () => {
  const [mainVersion, subVersion, phaseVersion] = packageJSON.version.split('.');
  return `${mainVersion}.${subVersion}.${+phaseVersion + 1}`;
};

const publish = async () => {};
