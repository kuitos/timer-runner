#!/usr/bin/env node
import programs from 'commander';
import path from 'path';
import { version } from '../package.json';
import start from './index';

programs
	.version(version)
	.option('-d, --dir <taskDir>', 'task dir, default tasks dir in current dir', path.join(process.cwd(), './tasks'))
	.option('-s, --secret <secret>', 'secret file path, default secret.yml in current dir', path.join(process.cwd(), './secret.yml'))
	.parse(process.argv);

process.on('unhandledRejection', (reason) => {
	console.error(reason);
	process.exit(1);
});

process.on('uncaughtException', (error) => {
	console.error(error.stack);
	process.exit(1);
});

process.on('SIGINT', () => {
	process.exit();
});

(async () => {
	try {
		await start(programs.dir, programs.secret);
		console.info('-------------------> app initialized!');
	} catch (e) {
		console.error(e);
	}
})();
