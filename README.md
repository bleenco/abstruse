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

## Tests

### Server E2E Tests

```sh
npm run test:e2e
```

### Protractor E2E Tests

```sh
npm run test:protractor
```

## GitHub Integration

To integrate `abstruse` with GitHub go to `Settings -> Webhooks` and add URL where you deployed abstruse with `/webhooks/github` suffix.

Secret is defined in `~/.abstruse/config.json` and after updating the secret abstruse instance need to be restarted.

Default secret is `thisIsSecret`.

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
  <img src="https://user-images.githubusercontent.com/1796022/28693241-05049a04-7324-11e7-9c8b-0b3132cdf21b.png">
</p>

## Licence

MIT
