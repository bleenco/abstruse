<p align="center">
  <img src="https://user-images.githubusercontent.com/1796022/28603921-79363332-71c7-11e7-811f-e5079f1b9f9c.png">
</p>

# Abstruse

[![AbstruseCI](https://abstruse.bleenco.io/badge/1)](https://abstruse.bleenco.io/repo/1)

[Abstruse](https://abstruse.bleenco.io/) is a continuous integration platform requiring zero or minimal configuration to get started, providing safe testing and deployment environment using [Docker](https://docker.github.io/) containers. It integrates seamlessly with all git hosted services as [GitHub](https://github.com/), [BitBucket](https://bitbucket.org/), [GitLab](https://about.gitlab.com/) and [gogs](https://gogs.io/).

## Prerequirements

`Abstruse` requires `SQLite3` and `Docker` to be installed.

## Installation

```sh
$ npm install abstruse -g
```

## Running abstruse

After the installation, running a server is as easy as running the following command:

```sh
$ abstruse
```

## Tests

#### Server e2e tests

```sh
npm run test:e2e
```

#### Protractor e2e tests

```sh
npm run test:protractor
```

## GitHub Integration

<p align="left">
  <img src="https://user-images.githubusercontent.com/1796022/29858646-a6ba0772-8d5e-11e7-9280-ef5a9d4ca0f4.png" width="700">
</p>

#### 1. Configuring secret token

Abstruse configuration file is located in **~/.abstruse/config.json**.

The integration of GitHub webhooks and Abstruse is done using `secret` token. The default `secret` is set to **thisIsSecret**.

**It is recommended to change the default `secret` token and restart abstruse to apply changes.**

#### 2. Setting up Github Webhooks

In repository `Settings` navigate to `Webhooks` section in the menu. Click `Add Webhooks` and fill in the required information.

An example of a successful webhook entry can be seen in a screenshot below. Instead of `https://abstruse.bleenco.io` the URL of your choice has to be entered.

<p align="left">
  <img src="https://user-images.githubusercontent.com/1796022/29858741-220462f6-8d5f-11e7-8b3b-b6418b46684c.png" width="700">
</p>

#### 3. Initiating Abstruse repositories

Your new code repositories will automatically appear in Abstruse
after the first commit or pull request.

**Note: Please make sure your local repository includes .abstruse.yml file.**

#### 4. Setting up protected branches

In repository `Settings` navigate to `Branches` section in the menu. Click `Edit` next to the branch you want to protect and select the checkbox `continuous-integration/abstruse` as required.

<p align="left">
  <img src="https://user-images.githubusercontent.com/1796022/29859098-d90d5682-8d60-11e7-92ff-b089daf4f7a8.png" width="700">
</p>

## Licence

The MIT License

Copyright (c) 2017 Bleenco GmbH http://bleenco.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
