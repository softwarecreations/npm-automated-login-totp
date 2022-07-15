# npm-automated-login-totp

A script to perform `npm login` (previously `npm adduser`) without having to interact with the shell.

This allows fully automated (non-interactive) NPM user login that you can run inside a shell script or docker file or upon boot (or whatever) on headless containers, VM's or systems.

## Security warning
By using this script, obviously you're losing 2FA security on your NPM account.

* Use entirely at your own risk
* Don't run on insecure systems
* Don't publish security sensitive packages without 2FA
* Don't login to security sensitive usernames using this script
* Your account is only as safe as the system that your credentials are on

### Installation

    npm install -g npm-automated-login-totp

### Usage

##### CLI

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
- `-g --generate-otp`: Generate TOTP (only)
- `-e --email`: NPM Email

Note that the command line arguments override the environment variables.

##### Example

Logging in to a private NPM registry:

```
npm-automated-login-totp --registry https://example.com --username testUser --password testPass --otp-secret ABC123 --email test@example.com
```

##### Issues, PR's etc
All are welcome.

##### License
MIT

##### Dependencies
Package name   | Purpose
---            | ---
colors         | Colors in terminal
commander      | Get command-line arguments
totp-generator | Generate TOTP's for login

##### Credits
I found [ksafavi/npm-cli-adduser](https://github.com/ksafavi/npm-cli-adduser) which as of 2022-06-20 is unmaintained, 4 years old and not working. I forked and changed around 93% of it. I basically just kept the command-line switches but DRY'd up the code around them.

##### Keywords so that people can find this project
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
