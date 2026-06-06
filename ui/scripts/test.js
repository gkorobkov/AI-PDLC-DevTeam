const { spawn } = require('child_process');

const filteredArgs = process.argv.slice(2).filter(
  (arg) => !/^--watchAll(?:=(true|false))?$/.test(arg)
);

const child = spawn(
  'npx',
  ['vitest', 'run', ...filteredArgs],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  }
);

child.on('exit', (code) => {
  process.exit(code);
});

child.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
