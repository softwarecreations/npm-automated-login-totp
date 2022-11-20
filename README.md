# npm-automated-login-totp

Login to NPM, semi or fully automated, headless, scripted, non-interactive with a YubiCo YubiKey for 2FA (two factor authentication)

I have two versions of this project
> * Original version: https://www.npmjs.com/package/npm-automated-login-totp < You are here
> * Paranoid version: https://www.npmjs.com/package/npm-login-yubikey

## Newbie questions

### Newbies - What is 2FA?
If you don't know, read "2FA basic explanation" at the bottom of this page.

### Newbies - What is TOTP?
Time based One-Time-Password. If you've used Google Authenticator, Authy, AndOTP, etc then you've used it.

It starts by creating a secret, then your OTP app generally makes a new OTP, based on a the current time in a 15 second interval.

### Newbies - How npm-automated-login-totp works
NPM requires 2FA for login, so npm-automated-login-totp generates TOTP's (or gets them from your YubiKey) so that it can login to NPM.

## Installation - 2 minute setup
`npm install -g npm-automated-login-totp`

Example username is: `bob`

1. Create or get your TOTP-Secret for NPM
Run `npm-automated-login-totp --make-secret` ... you're done.
You can also make a TOTP-Secret with a TOTP app on your phone, then retrieve the secret, but that's pointless.

2. Enable 2FA on your NPM account
Open your NPMjs.com profile page
https://www.npmjs.com/settings/bob/profile > Two-Factor Authentication

3. Add this to your `~/.profile` or `~/.bashrc`
Put your details inside the quotes
```
export NPM_USER='bob'
export NPM_PASS='Secret-SeCreT-SECRET'
export NPM_EMAIL='bob@email.com'
export NPM_OTPSECRET='ABC123'
```

4. Close and reopen terminal

5. Run `npm-automated-login-totp`
You should see: Logged in as bob on https://registry.npmjs.org/

## Installation - YubiKey example (optional)
Notes
* Tested with YubiKey 5 Nano
* We call the TOTP key 'npm' but you can call it whatever you like.

6. Install yubikey-manager aka `ykman`
> * Debian/Ubuntu/PopOS `apt install yubikey-manager`
> * Fedora/Redhat `yum install yubikey-manager`
> * In Python: `pip install --user yubikey-manager`
> * Windows `choco install yubikey-manager`
> * Mac `brew install ykman`

7. Add your 'npm' secret to your YubiKey
(most secure if you do this from a separate clean and secure device)
Where FOOBAR is your OTP-Secret provided by npmjs.com

 > Semi automatic:  `ykman oath accounts add --touch npm FOOBAR`
 >
 > Fully automatic: `ykman oath accounts add npm FOOBAR`

8. Setup your environment variables

 > You can use your above config, and simply override the OTP-Secret like this
 > `npm-automated-login-totp --otp-secret yubikey`
 >
 > Or update your config to something like this
 > ```
 > export NPM_USER='bob'
 > export NPM_PASS='Secret-SeCreT-SECRET'
 > export NPM_EMAIL='bob@email.com'
 > export NPM_OTPSECRET='yubikey'
 > export NPM_OTPNAME='npm'
 > ```

Have fun!

### Say thanks
Star the repo
https://github.com/softwarecreations/npm-automated-login-totp

### Get notified of significant project changes
Subscribe to this issue https://github.com/softwarecreations/npm-automated-login-totp/issues/1

### PR's
Welcome

### Issues or Ideas
Make an issue https://github.com/softwarecreations/npm-automated-login-totp/issues

### License
MIT

### 3 Dependencies
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
- `NPM_OTPNAME`: TOTP name for NPM on your YubiKey (default is 'npm')
- `NPM_EMAIL`: NPM email

These command line arguments are also supported:

- `-r --registry`: NPM Registry
- `-s --scope`: NPM Scope
- `-a --always-auth`
- `-t --auth-type`: The authentication type
- `-u --username`: NPM Username
- `-p --password`: NPM Password
- `-o --otp-secret`: TOTP secret used to generate OTP's for 2FA login
- `-o --otp-name`: TOTP name for NPM on your YubiKey (default is 'npm')
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

### 2FA basic explanation
Real 2FA means that you authenticate from two separate devices that are running different operating systems. For example Windows/Linux/Mac as your first factor (password) and YubiKey/Android/IOS as your 2nd factor. Your second factor could be TOTP, or email. But if you have a backup of your TOTP secret, or access to your 2nd factor on your computer then you're not practising proper 2FA. It's like adding a security gate over your front door, and then leaving the gate key under the mat.

If you want to be as secure as possible (probably more secure than 99% of NPM users), then do proper 2FA.

If you want to use this project and practice proper 2FA, then use it with a YubiKey, where you create the secret on your YubiKey from a separate clean computer.

By using this project you agree that
* You're a big boy or a big girl
* You understand what 2FA is
* You take full responsibility for securing your devices where you store your authentication details

### Credits
I found [ksafavi/npm-cli-adduser](https://github.com/ksafavi/npm-cli-adduser) which as of 2022-06-20 is unmaintained, 4 years old and not working. I forked and changed around 96% of it. I basically just kept a few of the command-line switches but DRY'd up the code around them.

#### Keywords so that people can find this project

This script performs `npm login` (previously `npm adduser`) without you needing to interact with the shell.

This allows fully automated (non-interactive) NPM user login that you can run inside a shell script or docker file or upon boot (or whatever) on headless containers, VM's or systems.

* YubiKey 5 Series
* YubiKey 5 NFC
* YubiKey 4 Series
* YubiKey 4C
* YubiKey 4 Nano
* YubiKey 5 Nano
* YubiKey 5 Nano FIPS
* YubiKey 5 FIPS Series
* YubiKey 5C FIPS
* YubiKey 5Ci FIPS
* YubiCo
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
