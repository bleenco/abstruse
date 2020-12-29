# .abstruse.yml reference

The .abstruse.yml file at the root of the repo configures how Abstruse
is building, testing and deploying your code. This document will list
the different attributes abstruse understand and you can use to
configure your builds:

## `image`

The `image` attribute tells abstruse which image to use for the builds
of this repo. You can set different image for each entry in `matrix` or
just use the global image. There is an example in next section.

## `matrix`

The `matrix` attribute is an array of hash describing the different
builds you want to run for each commit. The most commonly used option
is `env`, which sets environment variable for the build.

Here's an example:

``` yaml
matrix:
  - env: SCRIPT='test' API_VERSION=2
  - env: SCRIPT='lint' API_VERSION=3
  - env: SCRIPT='test' API_VERSION=3
```

You can also specify `image` option in `matrix` array and override global `image` for that job,
here's an example:

```yaml
matrix:
  -
    env: SCRIPT='test' NODE_VERSION=10
    image: ubuntu:groovy
  -
    env: SCRIPT='test' NODE_VERSION=10
    image: ubuntu:trusty
  -
    env: SCRIPT='lint' NODE_VERSION=12
    image: ubuntu:focal
```

## `cache`

The `cache` attribute is an array of path that should be cached
between builds. When a build is successful, the paths in `cache` are
tar'd, stored and will be unpacked at the beginning of the next build.

Example:

``` yaml
cache:
  - node_modules
  - ~/.gems
  - /var/lib/something_else
```

## `branches`

The `branches` attribute allows you to restrict job execution to
certain branches. It contains a hash with two attributes: `test` and `ignore`.

- `test` contains an array of branch names or regexps on which to run test
- `ignore` contains an array of branch names or regexps on which NOT to run test.

Example:

```yaml
branches:
  test:
    - master
    - staging
    - production
    - feature/.*
    - fix/.*
  ignore:
    - .*-noci
```

## Install phase

The install phase setup the environment prior to build. It's composed
of 2 sub-phases, which contains an array of commands

- `before_install` commands are executed before the actual install occurs
- `install` commands are the actual install commands.

The install phase will be run before all the jobs configured in the
matrix and before the deploy phase

Example:

```yaml
before_install:
  - apt-get update
install:
  - apt-get install -y ruby
```

## Build/Script phase

After install phase, comes the build phase. It works similarly to
install phase, with different attributes containing commands to
execute:

- `before_script` commands are executed first
- `script` commands are executed next
- `after_successful` commands are executed if the script commands were successful
- `after_failure` commands are executed if the script commands failed
- `after_script` commands are executed after the script

  Example:

``` yaml
before_script:
  - service mysql start
script:
  - if [[ "$SCRIPT" ]]; then ./$SCRIPT; fi
after_script:
  - service mysql stop
  - curl -x POST http://my-other-service/ping_build
```

## Deploy phase

The deploy phase allows you to run commands (or a deployment provider)
after all the jobs configured in the matrix are terminated and successful.

It works in the same way as the Install phase and Build/Script phase,
using the following 3 attributes:

- `before_deploy` commands are executed before the deployment takes place
- `deploy` commands (or provider) are executed to deploy your code
- `after_deploy` commands will be executed after the `deploy` commands if they're sucessful

## Examples

### NodeJS Example

```yaml
image: ubuntu:focal

matrix:
  -
    env: SCRIPT=test NODE_VERSION=10
    image: ubuntu:trusty
  -
    env: SCRIPT=test NODE_VERSION=12
  -
    env: SCRIPT=test NODE_VERSION=14
  -
    env: SCRIPT=test NODE_VERSION=15
    image: ubuntu:groovy
  -
    env: SCRIPT=lint NODE_VERSION=15
    image: ubuntu:latest

before_install:
  - apt update && apt install -y wget
  - wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
  - nvm install $NODE_VERSION
  - npm i -g yarn

install:
  - yarn install

script:
  - if [[ "$SCRIPT" ]]; then yarn run $SCRIPT; fi

cache:
  - node_modules
```
