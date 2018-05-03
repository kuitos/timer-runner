#!/usr/bin/env node
import programs from 'commander';
import { version } from '../package.json';

programs
	.version(version)
	.command('run <taskDir>', 'run the tasks from YAML config dir')
	.parse(process.argv);
