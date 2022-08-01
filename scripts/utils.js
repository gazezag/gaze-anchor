const child_process = require('child_process');
const path = require('path');
// npm run dev
// npm run build

const getRunner = cmdType => {
  return (cmd, args = [], cwd = '.') => {
    return new Promise((resolve, reject) => {
      const bin = `${cmdType} ${cmd} ${args.join(' ')}`;
      console.info(`> running ${bin}`);
      child_process.exec(
        bin,
        {
          cwd
        },
        (err, stdout, stderr) => {
          if (err) reject([stderr, null, bin]);
          else resolve([null, stdout, bin]);
        }
      );
    });
  };
};

const npmRunner = getRunner('npm');
const gitRunner = getRunner('git');

const getRootPath = pkg => path.resolve(__dirname, '../packages/' + pkg);

const getArgs = () => process.argv.slice(2);

module.exports.utils = {
  npmRunner,
  gitRunner,
  getRootPath,
  getArgs
};
