/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-04-24 17:13
 */

import { AxiosRequestConfig } from 'axios';
import { readFile } from 'fs';
import { load } from 'js-yaml';
import { RecurrenceRule, scheduleJob } from 'node-schedule';
import path from 'path';
import tinyGlob from 'tiny-glob';
import { promisify } from 'util';
import http from './http';

const readFilePromise: (path: string, encoding: string) => Promise<string> = promisify(readFile);
const taskDir = path.join(__dirname, '../src/tasks');

type IApi = {
	url: string;
	method: 'get' | 'post';
	config: AxiosRequestConfig;
};

type ITask = {
	name: string;
	rule: RecurrenceRule;
	api: IApi;
};

async function fetch<T>(task: ITask): Promise<T | null> {

	const { api: { url, method, config } } = task;

	switch (method.toLowerCase()) {

		case 'get': {
			const response = await http.get<T>(url, config);

			return response.data;
		}

		case 'post': {
			const response = await http.post<T>(url, null, config);

			return response.data;
		}

		default:
			return null;
	}
}

async function start(): Promise<void> {

	const taskFiles = await tinyGlob('*.yml', { cwd: taskDir, filesOnly: true });
	const variables = load(await readFilePromise(path.join(__dirname, '../secret.yml'), 'utf-8'));

	taskFiles.forEach(async taskFile => {

		const taskConfig = load(await readFilePromise(path.join(taskDir, taskFile), 'utf-8'));

		const task: ITask = JSON.parse(JSON.stringify(taskConfig, (_, v) => {

			if (variables && variables.hasOwnProperty(v)) {
				// noinspection TsLint
				return (variables as any)[v];
			}

			return v;
		}));

		if (task) {

			scheduleJob(task.name, task.rule, async () => {

				try {
					console.info(`-------------------> ${task.name}: task starting!`);
					// noinspection TsLint
					await fetch(task as ITask);
					console.info(`-------------------> ${task.name}: task finished!`);
				} catch (e) {
					console.error(`-------------------> ${task.name}: task failed!`, e);
				}
			});

			console.info(`-------------------> ${task.name}: task initialized!`);
		}
	});
}

(async () => {
	try {
		await start();
		console.info('-------------------> app initialized!');
	} catch (e) {
		console.error(e);
	}
})();
