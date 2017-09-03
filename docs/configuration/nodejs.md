# Building a Node.JS Project

## Table of Contents

- [Specifying Node.JS Versions](#specifying-nodejs-versions)
- [Default Build Script](#default-build-script)
- [Dependency Management](#dependency-management)
- [Build Matrix](#build-matrix)
- [Examples](#examples)

### Specifying Node.JS Versions

The easiest way to specify Node.js versions is to use one or more of the latest releases in your `.abstruse.yml`:

- `node` latest stable Node.JS release
- `lts/*` latest LTS Node.JS release
- `8` latest 8.x release
- `7` latest 7.x release
- `6` latest 6.x release
- `5` latest 5.x release
- `4` latest 4.x release

```yml
language: node_js
node_js:
  - "7"
  - "8"
```

If you need more specific control of Node.js versions in your build, use any version
installable by `nvm.` If your `.abstruse.yml` contains a version of Node.JS that
`nvm` cannot install, such as `0.4`, the job errors immediately.

### Default Build Script

The default build script for projects using Node.JS is:

```sh
npm test
```

#### Using other Test Suites

You can tell `npm` how to run test suite by adding a line in `package.json`. For example, to test using `gulp`:

```js
"scripts": {
  "test": "gulp test"
}
```

### Dependency Management

#### Abstruse CI uses npm

Abstruse CI uses `npm` to install your project dependencies:

```sh
npm install
```

##### Using a specific npm version

Add the following to the `before_install` phase of `.abstruse.yml`:

```yml
before_install:
  - npm install -g npm@5.1.0
```

##### Caching with npm

Abstruse CI is able to cache the `node_modules` folder:

```yml
cache:
  directories:
    - "node_modules"
```

`npm install` will still run on every build and will update/install any new packages added to your `package.json` file.

#### Abstruse CI supports yarn

Abstruse CI detects use of `yarn`.

If both `package.json` and `yarn.lock` are present in the root directory of the repository, Abstruse CI will run the following
command instead of `npm install`:

```sh
yarn
```

Note that `yarn` requires Node.JS version `4` or later. If the job does not meet this requirement, `npm install` is used instead.

##### Using a specific yarn version

Add the following to the `before_install` phase of `.abstruse.yml`:

```yml
before_install:
  - curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version version-number
  - export PATH="$HOME/.yarn/bin:$PATH"
```

##### Caching with yarn

You can cache `$HOME/.cache/yarn` with:

```yml
cache: yarn
```

If your caching needs to include other directives, you can use

```yml
cache:
  directories:
    - "$HOME/.cache/yarn"
    - "node_modules"
```

### Build Matrix

For Node.JS projects, `env` and `node_js` can be used as arrays to construct a build matrix.

### Examples

```yml
language: node_js

matrix:
  - node_js: "8"
    env: SCRIPT=lint
  - node_js: "8"
    env: NODE_SCRIPT=./tests/run_e2e.js
  - node_js: "8"
    env: SCRIPT=protractor:abstruse

before_install:
  - npm config set spin false
  - npm config set progress false

install:
  - npm install
  - curl -fsSL get.docker.com -o get-docker.sh
  - chmod +x get-docker.sh
  - sudo ./get-docker.sh
  - sudo apt-get install sqlite3 -y

after_install:
  - sudo $(which node) ./tests/postinstall_ci.js
  - sudo usermod -aG docker abstruse
  - sudo /etc/init.d/docker start
  - sudo /etc/init.d/xvfb start
  - export DISPLAY=:99

script:
  - if [[ "$SCRIPT" ]]; then npm run-script $SCRIPT; fi
  - if [[ "$NODE_SCRIPT" ]]; then node ./$NODE_SCRIPT; fi
```

This will generate a matrix with 3 jobs, each one will run script that has specified as `env` in matrix definition.
