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

const totp = require('otplib').authenticator;
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
  .option('-g --generate-otp', 'Generate an OTP')
  .option('-m --make-secret', 'Generate an OTP Secret')
  .option('-v --verbose', 'Show some debug info')
  .option('-E --error', 'Show stderr')
  .option('-q --quiet', 'Silence NPM notices')
  .parse(process.argv)
);

const npmArgsA = ['login'];

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

if (program.generateOtp) {
  const otp = totp.generate(otpSecret);
  console.log(colors.brightCyan(otp));
  process.exit();
}

if (program.makeSecret) {
  const secret = totp.generateSecret();
  console.log(colors.brightCyan(secret));
  process.exit();
}

const npmP = spawn('npm', npmArgsA, { stdio:'pipe', shell:true });
let count=0, haveLoggedIn=0;

exitError = s => { // re-define exitError to also end the stdin stream
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

const bit = x => x ? 1 : 0;

/* Comments about NPM error output
  -
  NPM has made multiple arbitrary tweaks to it's error output, where they added/removed variations of /npm[ -]?notice\n/i combined or not combined with known messages that we check for.
  So we do not assume that /npm[ -]?notice\n/i will or won't be combined with messages that we check for.
  The goal is to silence all useless junk, but show anything that's possibly important or worth seeing.
  -
  At one point I was going to add the lines to an array and reset a timer every time the lines come in, then process the data after the timer expires; but for now that seems to be unnecessary.
  -
  So for now, the current approach seems to be reliable, simplest and best.
*/
npmP.stderr.on('data', data => {
  const line = data.toString().replace(/npm *\n/i,'npm').replace(/npm[ -]?notice\n/i,'npm notice').trim();
  if (line.match(/^(npm)? ?(notice)?$/i)) return;
  if (line.match(/check your email/i)) exitError(`You have not configured TOTP on your NPM account, enable 2FA or whatever.`);
  const isLoginMsg   = bit(line.match(/log[ -]?in on /i));
  const isAuthMsg    = bit(line.match(/one[ -]?time[ -]password|OTP|auth(enticator)?[ -]app/i));
  const isAddUserMsg = bit(line.match(/adduser.+split.+login.+register.+alias.+command/i)); // silence this NPM warning that we have already taken care of: npm WARN adduser `adduser` will be split into `login` and `register in a future version. `adduser` will become an alias of `register`. `login` (currently an alias) will become its own command.
  const isUnknownMsg = bit(!isLoginMsg && !isAuthMsg && !isAddUserMsg);
  if (!program.quiet && (program.verbose || program.error || isUnknownMsg)) {
    console.log(`isLoginMsg:${isLoginMsg}, isAuthMsg:${isAuthMsg}, isAddUserMsg:${isAddUserMsg}, isUnknownMsg:${isUnknownMsg}`);
    console.log(colors.red(`NPM UNKNOWN STDERR: ${line}`));
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
    const otp = totp.generate(otpSecret);
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
