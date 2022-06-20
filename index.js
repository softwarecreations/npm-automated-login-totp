#!/usr/bin/env node

/**
 * Copyright 2022 @softwarecreations
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License in the LICENSE file in the
 * root directory of this source tree.
 *
 * Originally forked from https://github.com/ksafavi/npm-cli-adduser
 */

'use strict';

const totp = require('totp-generator');
const colors = require('colors');
const commander = require('commander');
const { spawn } = require('child_process');
const packageJson = require('./package.json');

const program = ( new commander.Command(packageJson.name)
  .version(packageJson.version)
  .usage('[--registry=url] [--scope=@orgname] [--always-auth] [--auth-type=legacy]')
  .option('-r --registry <registry>', 'The base URL of the npm package registry')
  .option('-s --scope <scope>', 'If specified, the user and login credentials given will be associated with the specified scope')
  .option('-a --always-auth', 'If specified, save configuration indicating that all requests to the given registry should include authorization information')
  .option('-t --auth-type <authType>', 'What authentication strategy to use with')
  .option('-u --username <username>', 'Name of user to fetch starred packages for')
  .option('-p --password <password>', 'Password of the user')
  .option('-e --email <email>', 'Email of the user')
  .option('-o --otp-secret ABC123', 'Secret for generating TOTP')
  .option('-g --generate', 'Generate an OTP')
  .option('-v --verbose', 'Show some debug info')
  .option('-q --quiet', 'Silence NPM notices')
  .parse(process.argv)
);

const npmArgsA = ['adduser'];

let exitError = s => {
  process.stderr.write(colors.red(`Error: ${s}\n`));
  process.exit(1);
};
const getString = (label, paramName, envName, { required=0 }={ required:0 }) => {
  envName = 'NPM_' + envName;
  if (typeof program[  paramName]==='string' && program[  paramName].trim().length) return program[  paramName].trim();
  if (typeof process.env[envName]==='string' && process.env[envName].trim().length) return process.env[envName].trim();
  if (required) exitError(`${label} is required`);
  return '';
};
const passNpmArg = (npmParam, paramName, envName) => {
  envName = 'NPM_' + envName;
  if (typeof program[  paramName]==='string' && program[  paramName].trim().length) npmArgsA.push( `--${npmParam}=` + program[  paramName].trim());
  if (typeof process.env[envName]==='string' && process.env[envName].trim().length) npmArgsA.push( `--${npmParam}=` + process.env[envName].trim());
};

// pass arguments through to npm (if provided)
//         NPM param  , param name, environment variable suffix
passNpmArg('auth-type', 'authType', 'AUTHTYPE');
passNpmArg('registry' , 'registry', 'REGISTRY');
passNpmArg('scope'    , 'scope'   , 'SCOPE'   );

// get strings:             label                param name,  environment variable suffix
const username  = getString('username'         , 'username' ,     'USER');
const password  = getString('password'         , 'password' ,     'PASS');
const email     = getString('email'            , 'email'    ,     'EMAIL');
const otpSecret = getString('TOTP Secret (2FA)', 'otpSecret', 'OTPSECRET');

if (program.generate) {
  const otp = totp(otpSecret);
  console.log(colors.brightCyan(otp));
  process.exit();
}

const npmP = spawn('npm', npmArgsA, { stdio:'pipe', shell:true });
let count=0, haveLoggedIn=0;

exitError = s => {
  process.stderr.write(colors.red(`Error: ${s}\n`));
  npmP.stdin.end();
  process.exit(1);
};

npmP.on('exit', code => {
  if (!haveLoggedIn || program.verbose) console.log(`NPM HAS ENDED BY ITSELF`);
  process.exit(code);
});

const assertIsStep = step => {
  if (count++ <= step) return;
  exitError(`count:${count} > step:${step}`);
};

const npmWrite = s => {
  if (program.verbose) console.log(`TO NPM: ${s}`);
  npmP.stdin.write(s + '\n');
};

const stdErrA = [];
let tmrShowStdErr = '';
npmP.stderr.on('data', data => {
  const line = data.toString();
  stdErrA.push(line);
  if (!line.match(/^npm ?(notice)?$/)) {
    const buf = stdErrA.join('\n').replace(/npm *\n/,'npm').replace(/npm *notice\n/,'npm notice');
    if (buf.match(/check your email/i)) {
      exitError(`You have not configured TOTP on your NPM account, enable 2FA or whatever.`);
    } else if (buf.match(/^npm notice/)) {
      if ((buf.match(/log[ -]?in on /i) || buf.match(/one-time password|OTP|authenticator app/i)) && !program.verbose) {
        // don't log
      } else {
        console.log(colors.cyan(buf));
      }
    } else {
      console.log(colors.red(`NPM STDERR: ${buf}`));
    }
    stdErrA.length = 0;
  }
});


npmP.stdout.on('data', data => {
  const npmS = data.toString();
  if (program.verbose) console.log('VERBOSE PASSTHROUGH: ' + npmS);
  if (npmS.match(/check your email/i)) {
    exitError(`You have not configured TOTP on your NPM account, enable 2FA or whatever.`);
  } else if (npmS.match(/username/i)) {
    assertIsStep(0);
    npmWrite(username);
  } else if (npmS.match(/one-time password|OTP|authenticator app/i)) {
    assertIsStep(3);
    const otp = totp(otpSecret);
    npmWrite(otp);
    npmP.stdin.end(); // this is the last thing that we enter, so we end the stream
  } else if (npmS.match(/password/i)) {
    assertIsStep(1);
    npmWrite(password);
  } else if (npmS.match(/email/i)) {
    assertIsStep(2);
    npmWrite(email);
  } else if (npmS.match(/logged in as/i)) {
    haveLoggedIn = 1;
    if (!program.quiet) console.log(colors.green(npmS.trim()));
  } else if (npmS.match(/.*err.*/i)) {
    console.log(`Unknown error`)
    npmP.stdin.end();
  } else if (!program.verbose) {
    if (npmS.match(/npm notice/i)) {
      if (!program.quiet) console.log('NOTICE (NOT QUIET): ' + npmS);
    } else {
      if (!showingOutput) console.log(`Unknown NPM output: ${npmS}`);
    }
  }
});
