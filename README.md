<p align="center" style="margin: 20px 0 40px 0;">
  <img src="https://user-images.githubusercontent.com/1796022/41514005-9e827b86-72a3-11e8-9ca5-67736d9cab3e.png">
</p>

## Abstruse

[![AbstruseCI](https://ci.bleenco.io/badge/1)](https://ci.bleenco.io/repo/1)
[![Slack](https://slackin-xxrlxvwnmd.now.sh/badge.svg)](https://join.slack.com/t/abstruse/shared_invite/enQtNDI0MzUxMTQ1OTExLTMyNGRiYjllMTQ4NjkzZDkwNDM4NGIwMGM2YjA5NjFmNzI3MzdkMWExYWRlNWQ1N2NjNzI4NDlhOTFmNGM5ZTM)

*The majority of widely used browsers (except IE) are tested on BrowserStack.*

[Abstruse](https://abstruse.bleenco.io/) is a continuous integration platform requiring zero or minimal configuration to get started, providing safe testing and deployment environment using [Docker](https://docker.github.io/) containers. It integrates seamlessly with all git hosted services as [GitHub](https://github.com/), [BitBucket](https://bitbucket.org/), [GitLab](https://about.gitlab.com/) and [gogs](https://gogs.io/).

### Live Demo

[https://ci.bleenco.io](https://ci.bleenco.io)

### Quick Start (Video)

Video presents how easy is to install Abstruse CI and run sample build (2mins).

[https://www.youtube.com/watch?v=xmizxTGk92k](https://www.youtube.com/watch?v=xmizxTGk92k)

### Preview

<p align="center">
  <img src="https://user-images.githubusercontent.com/1796022/35201536-9103e1e8-ff1c-11e7-9461-1dc168629597.png">
</p>

More screenshots can be found [here](docs/SCREENSHOTS.md)

## Why Abstruse?
We saw many projects relying on outdated open source continuous integration (CI) solutions that were widely adopted in the past, but unfortunately cannot answer new requirements from the industry. On the other hand, commercial CI solutions have all this great features (i.e. Travis CI), but they cost money. Hence, numerous organizations decide to cut costs and go with legacy open source CI solutions or not use CI solutions at all. This kills the code quality and increases software maintenance costs. We want to change this and equip developers with the commercial-grade open source CI solution that differentiates from the rest by simplicity, scalability and up-to-date technology stack.

Not convinced yet? We compared **[Abstruse 1.0.0](https://github.com/bleenco/abstruse)** with the most popular open source CI platform of all times -- **[Jenkins 2.60.3](https://github.com/jenkinsci/jenkins)** -- and measured the time of execution, CPU and memory consumption while running [Java-Design-Patterns 1.17.0](https://github.com/iluwatar/java-design-patterns) and [Angular 5.0.0-beta.7](https://github.com/angular/angular) tests.

*We used the following machine for benchmarking:
Intel i7-4700HQ @ 2.40GHz CPU, 12GB DDR3 1600 MHz, 256 SSD.*

### **Abstruse vs Jenkins**
When testing Java-Design-Patterns 1.17.0 (*Figure 1*), Abstruse 1.0.0 outperforms Jenkins 2.60.3 by 25.84% in time, 52.36% in CPU consumption and 45.96% in memory use.

When testing Angular 5.0.0-beta.7, Abstruse outperforms Jenkins by 25.84% in time, 6.27% in CPU consumption and 35.49% in memory use.

<p align="center">
  CPU Usage (%)
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/3041169/31200826-a2b4292c-a95c-11e7-8d73-c395f7b37355.jpg">
</p>

<p align="center">
  Memory Usage (GB)
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/3041169/31200825-a2b3ab3c-a95c-11e7-9d0e-7c48af6730f9.jpg">
</p>

*Figure 1*: Testing Java-Design-Patterns 1.17.0 with Abstruse (left) and Jenkins (right).

For more details on benchmarking visit our [benchmarking section](docs/BENCHMARKING.md).

## Quickstart
* [Dependencies](docs/DEPENDENCIES.md)
* [Installation](docs/INSTALLATION.md)
* [Integrating Git Providers](docs/INTEGRATING_GIT_PROVIDERS.md)

## Working with us

We would love to receive community support. Whether fixing bugs or creating new features - we would appreciate it! Please read our [guideline](CONTRIBUTION.md) for contribution and don't forget to check our [issues list](https://github.com/bleenco/abstruse/issues).

## License

```
The MIT License

Copyright (c) 2018 Bleenco GmbH https://bleenco.com

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
```
