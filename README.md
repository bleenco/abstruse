<p align="center">
  <img src="https://user-images.githubusercontent.com/1796022/27810379-cf213604-6059-11e7-9b85-33ba4cea93e5.jpg">
</p>

# abstruse

Run Continuous Integration (CI) on your own servers.

Built with latest techonologies using **Node.JS**, **Angular** and **RxJS**.

Provides safe and reliable testing & deployment environment using Docker containers.

## Current Status

abstruse is under heavy development and will be ready for serious use in a matter of weeks.

We are already testing some of our repositories on abstruse, but currently we don't have a proper hosting so we unfortunatelly
can't share the actual demo with you.

In the meantime you can check out screenshots [here](https://github.com/bleenco/abstruse/wiki/Screenshots-(Preview)).

You are welcome to install & test abstruse locally, but please do not open any issues yet.

## Installation

```sh
$ npm install abstruse -g
```

## Running abstruse

After install is done running a server is as easy as running below command :-)

```sh
$ abstruse
```

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

## Preview

- [Screenshots](https://github.com/bleenco/abstruse/wiki/Screenshots-(Preview))

## Licence

MIT
