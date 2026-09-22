// Shared installer copies only this small launcher, never the worker or credentials.
import { readFileSync, lstatSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

try {
  const projectRoot = path.dirname(fileURLToPath(import.meta.url));
  const configPath = path.join(projectRoot, '.cheap-worker.json');
  const stat = lstatSync(configPath);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || stat.size > 16384) throw Error();
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  if (config.enabled === false) {
    console.log(JSON.stringify({ status: 'failure', error: 'DISABLED', message: 'Project delegation is disabled.' }));
    process.exitCode = 1;
  } else {
    if (config.enabled !== true || typeof config.workerPath !== 'string' || !path.isAbsolute(config.workerPath)) throw Error();
    const args = process.argv.slice(2);
    if (args.some(arg => arg === '--project-root' || arg.startsWith('--project-root='))) {
      console.log(JSON.stringify({ status: 'failure', error: 'INVALID_ARGUMENT', message: 'Adapter pins the project root; use the shared CLI for other projects.' }));
      process.exitCode = 1;
    } else {
      const child = spawn(process.execPath, [path.join(config.workerPath, 'tools/cheap-worker/cli.mjs'),
        '--project-root', projectRoot, ...args], { cwd: projectRoot, stdio: 'inherit', shell: false });
      child.on('error', () => {
        console.log(JSON.stringify({ status: 'failure', error: 'WORKER_UNAVAILABLE', message: 'Check the shared worker location.' }));
        process.exitCode = 1;
      });
      child.on('exit', code => { process.exitCode = code ?? 1; });
    }
  }
} catch {
  console.log(JSON.stringify({ status: 'failure', error: 'ADAPTER_CONFIG', message: 'Check the local .cheap-worker.json configuration.' }));
  process.exitCode = 1;
}
