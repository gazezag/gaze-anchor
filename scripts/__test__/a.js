const child_process = require('child_process');
// npm run dev
// npm run build

const getRunner = cmdType => {
  return (cmd, args = [], cwd = '.') => {
    return new Promise(resolve => {
      const bin = `${cmdType ? cmdType + ' ' : ''}${cmd} ${
        Array.isArray(args) ? args.join(' ') : args
      }`;
      console.info(`> running ${bin}`);
      child_process.exec(
        bin,
        {
          cwd
        },
        (err, stdout, stderr) => {
          if (err) resolve([stderr, null, bin]);
          else resolve([null, stdout, bin]);
        }
      );
    });
  };
};

const shRuner = getRunner();

const run = async () => {
  const [err, res] = await shRuner('echo', '"Hello"');
  console.log(err);
  console.log(res);
};

run();
