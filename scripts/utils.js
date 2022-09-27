const execa = require('execa');
const { cyan } = require('chalk');

const getArgs = () => process.argv.slice(2);

const run = (bin, args, opts = {}) => execa(bin, args, { stdio: 'inherit', ...opts });

const step = msg => console.log(cyan(msg));

module.exports = {
  getArgs,
  run,
  step
};
