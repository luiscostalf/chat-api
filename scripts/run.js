#!/usr/bin/env node
require('colors');
const sh = require('shelljs');
const Gaze = require('gaze')
const ENV = (process.env['env'] || 'dev').toLowerCase();
const path = require('path')
const asyncProcesses = [];
switch (ENV) {
    case 'dev':
        let timeoutHandler;
        new Gaze('dist/**/*').on('changed', function (err,filepath) {
            if (timeoutHandler) {
                clearTimeout(timeoutHandler);
            }
            timeoutHandler = setTimeout(() => {
                sh.exec('pm2 reload all');
                clearTimeout(timeoutHandler);
            }, 1000);
        });
        run({ logs: true });
        break;
    case 'staging':
    case 'test_prod':
    case 'prod':
        run({ logs: false });
        break;
    default:
        sh.echo(`unknown env: ${ENV}`.red);
        sh.exit(1);
        break;
}

process.on('SIGINT', () => {
    if (asyncProcesses.length > 0) {
        asyncProcesses.forEach(proc => proc.kill());
    }
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

function run(options) {
    options = options || {};
    options.logs = options.logs || false;

    if (sh.exec(`pm2 start pm2.json`).code !== 0) {
        sh.echo('failed to start app...'.red);
    }

    if (options.logs) {
        let logs = sh.exec('pm2 logs', { async: true });
        asyncProcesses.push(logs);
        return;
    }

    asyncProcesses.push(sh.exec('tail -f /dev/null', { async: true }));
    // asyncProcesses.push(sh.exec('node ./dist/main.js', { async: true }));
}
