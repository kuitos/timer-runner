/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-04-24 17:13
 */

import { AxiosRequestConfig } from 'axios';
import { readFile } from 'fs';
import { load } from 'js-yaml';
import cloneDeep from 'lodash.clonedeep';
import { RecurrenceRule, scheduleJob } from 'node-schedule';
import path from 'path';
import qs from 'querystring';
import tinyGlob from 'tiny-glob';
import { promisify } from 'util';
import http from './http';

const readFilePromise: (path: string, encoding: string) => Promise<string> = promisify(readFile);

type Error = {
	field: string;
	assert: boolean;
	msg: string;
};

type ITask = {
	name: string;
	rule: RecurrenceRule;
	api: AxiosRequestConfig;
	error?: Error;
};

async function fetch<T>(task: ITask): Promise<T | null> {

	// create a new task copy to keep original data maintained
	const { api: config, error } = cloneDeep(task);

	if (config.headers['content-type'] && config.headers['content-type'].indexOf('application/x-www-form-urlencoded') !== -1) {
		config.data = qs.stringify(config.data);
	}

	if (process.env.LOGGER_LEVEL === 'debug') {
		console.log(task.name, config);
	}

	const response = await http.request(config);

	if (error) {
		const { field, assert } = error;
		if (field && !!response.data[field] === assert) {
			throw response;
		}
	}

	return response.data;
}

export default async function start(tasksDir: string, secret: string): Promise<void> {

	const taskFilePaths = await tinyGlob('*.yml', { cwd: tasksDir, filesOnly: true });
	const variables = load(await readFilePromise(secret, 'utf-8'));

	taskFilePaths.forEach(async taskFilePath => {

		const taskConfig = load(await readFilePromise(path.join(tasksDir, taskFilePath), 'utf-8'));

		const task: ITask = JSON.parse(JSON.stringify(taskConfig, (_, v) => {

			if (variables && variables.hasOwnProperty(v)) {
				// tslint:disable-next-line
				return (variables as any)[v];

			}

			return v;
		}));

		if (task) {

			scheduleJob(task.name, task.rule, async () => {

				try {
					console.info(`-------------------> ${task.name}: task starting!`);
					// tslint:disable-next-line
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
