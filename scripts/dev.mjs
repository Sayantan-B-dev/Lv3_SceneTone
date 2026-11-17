import { spawn } from 'node:child_process';

const apps = ['backend', 'frontend'];

const children = apps.map((app) =>
  spawn(`npm run dev --prefix ${app}`, {
    stdio: 'inherit',
    shell: true,
  }),
);

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    child.kill();
  }
  process.exit(code);
}

for (const child of children) {
  child.on('exit', (code) => {
    if (!shuttingDown && code !== 0) {
      shutdown(code ?? 1);
    }
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
