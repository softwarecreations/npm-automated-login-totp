# npm-automated-login-totp

Login to NPM, fully automated, headless, scripted, non-interactive.

### What is 2FA?
If you don't know, read "2FA for dummies" at the bottom of this page.

### Installation
`npm install -g npm-automated-login-totp`

### 2 minute setup
Example username is `bob`

1. First enable 2FA on your NPM account, you can do this with AndOTP, Authy (or whatever TOTP app that you like) or simply run `--make-secret`
https://www.npmjs.com/settings/bob/profile > Two-Factor Authentication
2. Your authenticator app should allow you to view your OTP secret; you will need it to continue.

3. Add this to your `~/.profile` or `~/.bashrc`
#Fill in the stuff after the equals sign
export NPM_USER='bob'
export NPM_PASS='Secret-SeCreT-SECRET'
export NPM_EMAIL='bob@email.com'
export NPM_OTPSECRET='ABC123'

4. Close and reopen terminal

5. Run `npm-automated-login-totp`
You should see: Logged in as bob on https://registry.npmjs.org/

### Say thanks
Star the repo
https://github.com/softwarecreations/npm-automated-login-totp

### Get notified of significant project changes
Subscribe to this issue https://github.com/softwarecreations/npm-automated-login-totp/issues/1

## YubiKey support
Coming soon. Subscribe for YubiKey updates https://github.com/softwarecreations/npm-automated-login-totp/issues/2

### PR's
Welcome

### Issues or Ideas
Make an issue https://github.com/softwarecreations/npm-automated-login-totp/issues

### License
MIT

### Dependencies
Package name   | Purpose
---            | ---
colors         | Colors in terminal
commander      | Get command-line arguments
otplib         | Generate TOTPs and secrets
~~totp-generator~~ | ~~Generate TOTP's for login~~

### `npm-automated-login-totp --help`

You can either provide the required credentials inline, or via environment variables.

`npm-automated-login-totp` supports the following environment variables:

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

Useful action commands

- `-g --generate-otp`: Generate TOTP (only)
- `-m --make-secret`: Make a new secret (if you use this, you don't need a separate app)


### CLI Example

#### If you don't want to use an authenticator app (eg: on your phone)
`npm-automated-login-totp --make-secret`

#### If you've provided required environment variables
`npm-automated-login-totp`

#### If you're providing the bare minimum inline
`npm-automated-login-totp --username testUser --password testPass --otp-secret ABC123 --email test@example.com`

#### Logging in to a private NPM registry:
```
npm-automated-login-totp --registry https://example.com --username testUser --password testPass --otp-secret ABC123 --email test@example.com
```

### Changelog
- 1.1.8 Refactor & improve NPM Error parser
- 1.2.0 Switch from `totp-generator` to `otplib` so that I could add the `--make-secret` option. Tweaked stderr parser to respect `--quiet`.
- 1.3.2 NPM added web browser login as the default, but now they accept OTP via commandline, so this project is better than ever now.

### 2FA for dummies
Real 2FA means that you authenticate from two separate devices that are running different operating systems. For example Windows/Linux/Mac as your first factor (password) and Android/IOS as your 2nd factor. Your second factor could be TOTP, or email. But if you have a backup of your TOTP secret, or access to your email, or your email account's password on your computer then you're not practising 2FA. If your computer has access to your 2nd factor it's like adding a security gate over your front door, and then leaving the gate key under the mat.

If you want to be more secure than 99% of NPM users, then go ahead and do proper 2FA.

This project won't support proper 2FA until YubiKey support is added.

By using this project you agree that
* You're a big boy or a big girl
* You understand what 2FA is
* You take full responsibility for securing your devices where you store your authentication details

### Credits
I found [ksafavi/npm-cli-adduser](https://github.com/ksafavi/npm-cli-adduser) which as of 2022-06-20 is unmaintained, 4 years old and not working. I forked and changed around 96% of it. I basically just kept the command-line switches but DRY'd up the code around them.

#### Keywords so that people can find this project

This script performs `npm login` (previously `npm adduser`) without you needing to interact with the shell.

This allows fully automated (non-interactive) NPM user login that you can run inside a shell script or docker file or upon boot (or whatever) on headless containers, VM's or systems.

* LXC
* CRI-O
* rkt
* Podman
* runc
* containerd
* systemd-nspawn
* Docker
* udocker
* porto
* OpenVZ
* Bocker
* Rocket
* Vagga
* libvirt / libvirtd
* KVM
* Xen
* VMWare
* Hyper-v
* vSphere
* AWS / EC2 / Amazon Elastic containers / Azure
* Serverless containers
* Proxmox
* Qemu
* runv
* Firecracker
* sysbox
* Youki
* Plash
* railcar
* Kata containers
* podman
* Let Me Contain That For You
* cc-oci-runtime
* devops
* Continuous Integration
* Shell scripts: Bash / ZSH / Fish / ksh KornShell / Tcsh / Xonsh / Nushell / Ash / Dash / eshell
