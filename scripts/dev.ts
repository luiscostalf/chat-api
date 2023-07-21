#!/usr/bin/env ts-node
import * as CLA from 'command-line-args';
const sh = require('shelljs');
const path = require('path');
const colors = require('colors');
const ERRORS = {
    NETWORK_CHECK: 'Failed network check',
    NETWORK_CREATION: 'Failed to create network',
};

async function run(rebuildContainer: boolean = false) {
    // stop docker container
    networkCheck('dev', 'bridge');

    let dockerProc = sh.exec(
        `docker-compose  -f ${path.join('./docker', 'docker-compose.yml')} up --remove-orphans`,
        { async: true });

    process.on('SIGINT', () => {
        dockerProc.kill('SIGINT');
    });

}
function networkCheck(name, driver) {
    sh.echo(colors.green(`Checking if network ${name} exists...`));

    // check if the docker network is created
    let result = sh.exec(
        `docker network ls -q -f 'driver=${driver}' -f 'name=^${name}$'`,
        { silent: true }
    );

    if (result.code < 0) {
        throw new Error(ERRORS.NETWORK_CHECK);
    }

    let hasNetwork = result.stdout.trim() !== '';

    if (!hasNetwork) {
        sh.echo(colors.yellow('Network not found... Creating...'));
        let result = sh.exec(`docker network create -d bridge ${name}`);
        if (result.code < 0) {
            sh.error(colors.red(`${ERRORS.NETWORK_CREATION} -> ${result.stdout}`));
            return;
        }
    } else {
        sh.echo(colors.green('Network found...'));
    }
}

const args = CLA([
    { name: 'rebuild', type: Boolean }
])

run(args.rebuild).catch((error) => { console.error(error) });
