const { utils } = require('./utils.js');

const { gitRunner: run, getArgs } = utils;

//! bug here
const mergeAndPush = async () => {
  const [branch] = getArgs();
  if (!branch) {
    console.error('Input the name of branch!!');
    process.exit(1);
  }

  await run('checkout', ['main']);

  const [mergeErr, mergeLog, mergeCmd] = await run('merge', [branch]);
  if (mergeErr) {
    console.error(`Panic at running '${mergeCmd}'!\n`);
    console.log(mergeErr);
    process.exit(1);
  } else {
    console.info('Merging branches successfilly!!\n');
    // didn't get the log here
    console.log(mergeLog);
  }

  await run('checkout', [branch]);

  const [pushErr, pushLog, pushCmd] = await run('push', ['origin', branch]);
  if (pushErr) {
    console.error(`Panic at runing '${pushCmd}'!\n`);
    console.log(pushErr);
    process.exit(1);
  } else {
    console.info('Push successfilly!!\n');
    // didn't get the log here
    console.log(pushLog);
  }
};

// (async () => {
//   await mergeAndPush();
// })();
