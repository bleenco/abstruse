<p align="center">
  <img src="https://user-images.githubusercontent.com/1796022/28603921-79363332-71c7-11e7-811f-e5079f1b9f9c.png">
</p>

# abstruse

[![AbstruseCI](https://abstruse.bleenco.io/badge/1)](https://abstruse.bleenco.io/repo/1)

Run Continuous Integration (CI) on your own servers with zero configuration.

Provides safe and reliable testing & deployment environment using Docker containers.

## Installation

```sh
$ npm install abstruse -g
```

## Running abstruse

After install is done running a server is as easy as running below command

```sh
$ abstruse
```

## Requirements

`abstruse` requires `SQLite3` and `Docker` to be installed on your configuration.

## Tests

#### server e2e tests

```sh
npm run test:e2e
```

#### protractor e2e tests

```sh
npm run test:protractor
```

## GitHub Integration

<p align="left">
  <img src="https://user-images.githubusercontent.com/1796022/29858646-a6ba0772-8d5e-11e7-9280-ef5a9d4ca0f4.png" width="700">
</p>

#### 1. Set secret in configuration

Your configuration file is located in **~/.abstruse/config.json**

Set `secret` you want to use for integration Github webhooks with your abstruse instance. The default secret is **thisIsSecret**.

**After you change your secret keyword abstruse needs to be restarted.**

#### 2. Set Webhooks on Github

Under repository `Settings` navigate to `Webhooks` section. Click on `Add Webhooks`, then fill the form with appropriate data.

After you filled you data, form should look something like form below, but instead of `https://abstruse.bleenco.io` your URL must be entered.

<p align="left">
  <img src="https://user-images.githubusercontent.com/1796022/29858741-220462f6-8d5f-11e7-8b3b-b6418b46684c.png" width="700">
</p>

#### 3. Make a commit on your repository

To initiate creation of repository under abstruse make a commit on your repository on Github. Pull Request will work too.

**Note: you repository should include .abstruse.yml file.**

#### 4. Set up protected branches

On Github navigate to `Branches` section under `Settings`. Edit branch you want to mark as protected and check `continuous-integration/abstruse` as required.

<p align="left">
  <img src="https://user-images.githubusercontent.com/1796022/29859098-d90d5682-8d60-11e7-92ff-b089daf4f7a8.png" width="700">
</p>

## Sample Configuration

```yml
language: node_js

git:
  depth: 3

matrix:
  - node_js: "7"
    env: SCRIPT=lint
  - node_js: "7"
    env: SCRIPT=test:unit
  - node_js: "7"
    env: NODE_SCRIPT=./tests/run_e2e.js
  - node_js: "6"
    env: SCRIPT=test:unit
  - node_js: "6"
    env: NODE_SCRIPT=./tests/run_e2e.js

preinstall:
  - npm config set spin false
  - npm config set progress false

install:
  - npm install

test:
  - if [[ "$SCRIPT" ]]; then npm run-script $SCRIPT; fi
  - if [[ "$NODE_SCRIPT" ]]; then node ./$NODE_SCRIPT; fi
```

## Sneak Peek

<p align="center">
  <img src="https://user-images.githubusercontent.com/1796022/29797980-78c7a766-8c5a-11e7-87a7-98cebd085396.png">
</p>

## Licence

MIT
