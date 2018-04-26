/**
 * Created by Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2017-11-13
 */

import axios, { AxiosInstance } from 'axios';

const http: AxiosInstance = axios.create({
	baseURL: '/',
	headers: {
		'Cache-Control': 'no-cache',
	},
});

export default http;
