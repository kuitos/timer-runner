# timer-runner

[![Build Status](https://img.shields.io/travis/kuitos/timer-runner.svg?style=flat-square)](https://travis-ci.org/kuitos/timer-runner)
[![npm version](https://img.shields.io/npm/v/timer-runner.svg?style=flat-square)](https://www.npmjs.com/package/timer-runner)
[![npm downloads](https://img.shields.io/npm/dt/timer-runner.svg?style=flat-square)](https://www.npmjs.com/package/timer-runner)

⏲🧝‍♂️️a simple, YAML-based configurable timer runner

## How To Use
1. Install timer globally

   ```shell
   npm i timer-runner -g
   ```

2. Create timer.yml

   ```yaml
   name: timer
   script: timer-run
   watch: ./tasks
   env:
     LOGGER_LEVEL: debug
   error_file: ./logs/err.log
   out_file: ./logs/out.log
   merge_logs: true
   log_date_format: YYYY-MM-DD HH:mm:ss Z
   ```

3. Create a list of timer task with yaml in task dir

   ```yaml
   name: test
   rule:
     hour: 2
     minute: 0
     dayOfWeek: [0, 1, 2, 3, 4, 5, 6]
   api:
     url: https://abc.com/sign
     method: post
     headers:
       host: https://abc.com
       origin: https://abc.com
       content-type: application/x-www-form-urlencoded
       cookie: $secret
       x-requested-with: https://abc.com
     data:
       api_version: 1
       app_client_id: 1
   ```

4. Start the timer with pm2

   ```shell
   pm2 start timer.yml
   ```

   
