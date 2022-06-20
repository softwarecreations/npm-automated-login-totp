# npm-automated-login-totp

A script to perform `npm adduser` without having to interact with the shell.

This allows fully automated (non-interactive) NPM user login that you can run inside a bash script or docker file or upon boot (or whatever) on headless containers, VM's or systems.

## Security warning
By using this script, obviously you're losing 2FA security on your account.

* Use entirely at your own risk
* Don't run on insecure systems
* Don't publish security sensitive packages without 2FA
* Don't login to security sensitive usernames using this script
* Your account is only as safe as the system that your credentials are on

### Installation

    npm install -g npm-automated-login-totp

### Usage

##### CLI

`npm-cli-adduser` supports the following environment variables:

- `NPM_REGISTRY`: (optional) Private NPM registry to log in to (Default: https://registry.npmjs.org)
- `NPM_SCOPE`: NPM Scope
- `NPM_USER`: NPM username
- `NPM_PASS`: NPM password
- `NPM_OTPSECRET`: TOTP secret used to generate OTP's for 2FA login
- `NPM_EMAIL`: NPM email

These command line arguments are also supported:

- `-r --registry`: NPM Registry
- `-s --scope`: NPM Scope
- `-a --always-auth`
- `-t --auth-type`: The authentication type
- `-u --username`: NPM Username
- `-p --password`: NPM Password
- `-o --otp-secret`: TOTP secret used to generate OTP's for 2FA login
- `-e --email`: NPM Email

Note that the command line arguments override the environment variables.

##### Example

Logging in to a private NPM registry:

```
npm-cli-adduser --registry https://example.com --username testUser --password testPass --otp-secret ABC123 --email test@example.com
```

##### Credits
I found [ksafavi/npm-cli-adduser](https://github.com/ksafavi/npm-cli-adduser) which as of 2022-06-20 is unmaintained, 4 years old and not working. I forked and changed around 89% of it. I basically just kept the command-line switches but DRY'd up the code around them.
