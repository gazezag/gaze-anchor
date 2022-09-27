const { resolve } = require('path');
const { readdirSync, readFileSync, writeFileSync } = require('fs');
const { run, step } = require('./utils');

const packages = readdirSync(resolve(__dirname, '../packages'));
const public = readdirSync(resolve(__dirname, '../public'));

const getPkgRoot = (p, flag = 0) => resolve(__dirname, flag ? '../packages' : '../public', p);

const updateVersion = version => {
  // update root
  updatePackage(resolve(__dirname, '..'), version);
  // update sub packages
  public.forEach(path => updatePackage(getPkgRoot(path)), version);
};

const updatePackage = (pkgRoot, version) => {
  const path = resolve(pkgRoot, 'package.json');
  const pkgContent = JSON.parse(readFileSync(path, 'utf-8'));
  pkgContent.version = version;
  writeFileSync(path, JSON.stringify(pkgContent, null, 2) + '\n');
};

const publishPackage = async (pkgName, version) => {};

// TODO
