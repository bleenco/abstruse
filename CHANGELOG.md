<a name="0.9.2"></a>
## [0.9.2](https://github.com/bleenco/abstruse/compare/v0.8.16...v0.9.2) (2017-09-04)


### Bug Fixes

* **avatars:** hotfix for non PRs ([3e8b291](https://github.com/bleenco/abstruse/commit/3e8b291))
* **github-status:** fix sending statuses to Github (closes [#102](https://github.com/bleenco/abstruse/issues/102)) ([0c2ec11](https://github.com/bleenco/abstruse/commit/0c2ec11))
* **hotfix:** hot hot hot ([e98d75f](https://github.com/bleenco/abstruse/commit/e98d75f))
* fixed build running time ([83dd607](https://github.com/bleenco/abstruse/commit/83dd607))
* fixed progress bar ([38cee0e](https://github.com/bleenco/abstruse/commit/38cee0e))
* fixed sending commit status ([66cb7f2](https://github.com/bleenco/abstruse/commit/66cb7f2))
* restricted access to private repositories, builds and jobs ([40f5ca7](https://github.com/bleenco/abstruse/commit/40f5ca7))
* **pm:** fix some process and pm related stuff ([7cf2c0b](https://github.com/bleenco/abstruse/commit/7cf2c0b))
* **ui:** ui style updates ([646926f](https://github.com/bleenco/abstruse/commit/646926f))


### Features

* **avatars:** double avatars where needed (closes [#109](https://github.com/bleenco/abstruse/issues/109)) ([cb5cc88](https://github.com/bleenco/abstruse/commit/cb5cc88))
* cloning of github private repository ([704fe27](https://github.com/bleenco/abstruse/commit/704fe27))
* **config:** branches property ([2d80141](https://github.com/bleenco/abstruse/commit/2d80141))
* **config:** build config - generate jobs and envs ([f297a42](https://github.com/bleenco/abstruse/commit/f297a42))
* **docker:** bash script for switching JDKs ([c8b5b23](https://github.com/bleenco/abstruse/commit/c8b5b23))
* **ui:** progress bar ([110bf6a](https://github.com/bleenco/abstruse/commit/110bf6a))
* **ui-labels:** data-labels ([a1af711](https://github.com/bleenco/abstruse/commit/a1af711))



<a name="0.8.14"></a>
## [0.8.14](https://github.com/bleenco/abstruse/compare/v0.8.11...v0.8.14) (2017-08-29)


### Bug Fixes

* approximately time remaining ([678fcd7](https://github.com/bleenco/abstruse/commit/678fcd7))
* fix hasPermission issue ([b3c0014](https://github.com/bleenco/abstruse/commit/b3c0014))
* fix permissions ([f5b10fc](https://github.com/bleenco/abstruse/commit/f5b10fc))
* fixed server routes for repositories ([3a8c90e](https://github.com/bleenco/abstruse/commit/3a8c90e))
* hide stop build/job button if there is no jobs/build to stop ([28b2640](https://github.com/bleenco/abstruse/commit/28b2640))
* process-manager, send JobProcessEvent ([d644da4](https://github.com/bleenco/abstruse/commit/d644da4))
* progress bar fix ([e68fdb3](https://github.com/bleenco/abstruse/commit/e68fdb3))
* **commit:** last commit message ([c1d0dc2](https://github.com/bleenco/abstruse/commit/c1d0dc2))
* **pm:** concurrency in process-manager (cancelled processes) ([b5ceb53](https://github.com/bleenco/abstruse/commit/b5ceb53))


### Features

* bitbucket integration ([20aedc8](https://github.com/bleenco/abstruse/commit/20aedc8))
* gitlab integration ([b5429c6](https://github.com/bleenco/abstruse/commit/b5429c6))
* gogs integration ([09b7949](https://github.com/bleenco/abstruse/commit/09b7949))
* only user with permissions can restart or stop job/build ([25e958b](https://github.com/bleenco/abstruse/commit/25e958b))
* user permissions ([9b702fb](https://github.com/bleenco/abstruse/commit/9b702fb))
* **anonymous:** enable anonymous users ([52afa93](https://github.com/bleenco/abstruse/commit/52afa93))
* **dracula:** dracula theme for terminal (as default also ([1a2b74d](https://github.com/bleenco/abstruse/commit/1a2b74d))
* **process-manager:** concurrency ([0a2ced4](https://github.com/bleenco/abstruse/commit/0a2ced4))
* **ui:** user avatar upload ([2b7ee6d](https://github.com/bleenco/abstruse/commit/2b7ee6d))


### Performance Improvements

* **times:** async pipe for updating live times ([6dbf019](https://github.com/bleenco/abstruse/commit/6dbf019))



<a name="0.8.13"></a>
## [0.8.13](https://github.com/bleenco/abstruse/compare/v0.8.11...v0.8.13) (2017-08-28)


### Bug Fixes

* approximately time remaining ([678fcd7](https://github.com/bleenco/abstruse/commit/678fcd7))
* fix hasPermission issue ([b3c0014](https://github.com/bleenco/abstruse/commit/b3c0014))
* fix permissions ([f5b10fc](https://github.com/bleenco/abstruse/commit/f5b10fc))
* fixed server routes for repositories ([3a8c90e](https://github.com/bleenco/abstruse/commit/3a8c90e))
* hide stop build/job button if there is no jobs/build to stop ([28b2640](https://github.com/bleenco/abstruse/commit/28b2640))
* process-manager, send JobProcessEvent ([d644da4](https://github.com/bleenco/abstruse/commit/d644da4))
* progress bar fix ([e68fdb3](https://github.com/bleenco/abstruse/commit/e68fdb3))
* **pm:** concurrency in process-manager (cancelled processes) ([f55dbcf](https://github.com/bleenco/abstruse/commit/f55dbcf))


### Features

* **dracula:** dracula theme for terminal (as default also ([1a2b74d](https://github.com/bleenco/abstruse/commit/1a2b74d))
* bitbucket integration ([20aedc8](https://github.com/bleenco/abstruse/commit/20aedc8))
* gitlab integration ([b5429c6](https://github.com/bleenco/abstruse/commit/b5429c6))
* gogs integration ([09b7949](https://github.com/bleenco/abstruse/commit/09b7949))
* only user with permissions can restart or stop job/build ([25e958b](https://github.com/bleenco/abstruse/commit/25e958b))
* user permissions ([9b702fb](https://github.com/bleenco/abstruse/commit/9b702fb))
* **process-manager:** concurrency ([0a2ced4](https://github.com/bleenco/abstruse/commit/0a2ced4))


### Performance Improvements

* **times:** async pipe for updating live times ([6dbf019](https://github.com/bleenco/abstruse/commit/6dbf019))



<a name="0.8.11"></a>
## [0.8.11](https://github.com/bleenco/abstruse/compare/v0.8.9...v0.8.11) (2017-08-20)


### Bug Fixes

* minor hotfix ([8d4c85f](https://github.com/bleenco/abstruse/commit/8d4c85f))
* **builds:** add condition to check if jobs are present ([3ce43eb](https://github.com/bleenco/abstruse/commit/3ce43eb))


### Features

* **build-details:** stop build functionality ([be5b65a](https://github.com/bleenco/abstruse/commit/be5b65a))
* **favicon:** change favicon on build status ([3dbf648](https://github.com/bleenco/abstruse/commit/3dbf648))
* **tags:** show git tag data ([9e14668](https://github.com/bleenco/abstruse/commit/9e14668))


### Performance Improvements

* **build-details:** clear update times interval ([22c8ea2](https://github.com/bleenco/abstruse/commit/22c8ea2))



<a name="0.8.10"></a>
## [0.8.10](https://github.com/bleenco/abstruse/compare/v0.8.9...v0.8.10) (2017-08-20)


### Bug Fixes

* minor hotfix ([8d4c85f](https://github.com/bleenco/abstruse/commit/8d4c85f))
* **builds:** add condition to check if jobs are present ([3ce43eb](https://github.com/bleenco/abstruse/commit/3ce43eb))


### Features

* **favicon:** change favicon on build status ([3dbf648](https://github.com/bleenco/abstruse/commit/3dbf648))
* **tags:** show git tag data ([9e14668](https://github.com/bleenco/abstruse/commit/9e14668))


### Performance Improvements

* **build-details:** clear update times interval ([22c8ea2](https://github.com/bleenco/abstruse/commit/22c8ea2))



<a name="0.8.9"></a>
## [0.8.9](https://github.com/bleenco/abstruse/compare/v0.6.0...v0.8.9) (2017-08-20)


### Bug Fixes

* **avatar:** fix path to default user avatarr ([d7b4380](https://github.com/bleenco/abstruse/commit/d7b4380))
* **console:** fix console output ([612a98e](https://github.com/bleenco/abstruse/commit/612a98e))
* **github-integration:** fix GitHub integration ([41c4dc7](https://github.com/bleenco/abstruse/commit/41c4dc7))
* **hotfix:** fix build item functionality ([892dc90](https://github.com/bleenco/abstruse/commit/892dc90))
* **job:** fix job socket events ([788517f](https://github.com/bleenco/abstruse/commit/788517f))
* **pm:** correct sha for last commit ([a8fbc45](https://github.com/bleenco/abstruse/commit/a8fbc45))
* **pm:** update process manager ([36186ae](https://github.com/bleenco/abstruse/commit/36186ae))
* **process-manager:** catch promises, fix unworking things in pm ([a032e35](https://github.com/bleenco/abstruse/commit/a032e35))
* **regex:** fix terminal output regex ([547203b](https://github.com/bleenco/abstruse/commit/547203b))
* **setup:** docker image build fix ([59c9630](https://github.com/bleenco/abstruse/commit/59c9630))
* package-lock fix ([3ebba85](https://github.com/bleenco/abstruse/commit/3ebba85))
* **terminal:** fix terminal output ([f02d004](https://github.com/bleenco/abstruse/commit/f02d004))
* **terminal:** fix terminal output ([102ad37](https://github.com/bleenco/abstruse/commit/102ad37))
* **terminal:** update terminal code ([35c073f](https://github.com/bleenco/abstruse/commit/35c073f))
* **tests:** fix e2e tests for protractor ([8f3600f](https://github.com/bleenco/abstruse/commit/8f3600f))
* **tests:** fix tests ([866d959](https://github.com/bleenco/abstruse/commit/866d959))
* **tokens:** fix repository token getter ([1f3f283](https://github.com/bleenco/abstruse/commit/1f3f283))
* **ui:** fix style glitches, remove job and build history option from UI ([53a1768](https://github.com/bleenco/abstruse/commit/53a1768))
* bugfix, delete pr field before saveing build run ([fdcb60f](https://github.com/bleenco/abstruse/commit/fdcb60f))
* bugfixes ([e7768d0](https://github.com/bleenco/abstruse/commit/e7768d0))
* multiple fixes ([2da8c56](https://github.com/bleenco/abstruse/commit/2da8c56))
* show correct status of previous build run ([79009b4](https://github.com/bleenco/abstruse/commit/79009b4))
* **ui:** update ui accordingly ([099406f](https://github.com/bleenco/abstruse/commit/099406f))
* status badges ([db34b0e](https://github.com/bleenco/abstruse/commit/db34b0e))
* update build end_time field when last job finish successfully and fix build time issue ([e0eb1df](https://github.com/bleenco/abstruse/commit/e0eb1df))


### Features

* **access-tokens:** access token form & repository settings ([fead919](https://github.com/bleenco/abstruse/commit/fead919))
* **avatar:** default user avatar ([a07621e](https://github.com/bleenco/abstruse/commit/a07621e))
* **fonts:** Roboto fonts ([41c00a0](https://github.com/bleenco/abstruse/commit/41c00a0))
* **kill-container:** use more aggresive strategy to kill containers ([f95661b](https://github.com/bleenco/abstruse/commit/f95661b))
* **repositories:** search implementation ([613d1d6](https://github.com/bleenco/abstruse/commit/613d1d6))
* **settings:** access tokens ([4ee4f6e](https://github.com/bleenco/abstruse/commit/4ee4f6e))
* **sockets:** full-screen socket connection status if disconnected / retrying to server ([160248e](https://github.com/bleenco/abstruse/commit/160248e))
* **sshd:** enable ssh into containers ([5dd7698](https://github.com/bleenco/abstruse/commit/5dd7698))
* **status-badges:** status badges ([9a40e91](https://github.com/bleenco/abstruse/commit/9a40e91))
* **team:** team component and route ([84ce5e0](https://github.com/bleenco/abstruse/commit/84ce5e0))
* **terminal:** scroller ([18a10f9](https://github.com/bleenco/abstruse/commit/18a10f9))
* **tokens:** make statuses work with new implemented access tokens ([a68f774](https://github.com/bleenco/abstruse/commit/a68f774))
* **ui:** add abstruse logo on login screen ([d20ae17](https://github.com/bleenco/abstruse/commit/d20ae17))
* **ui:** job details modifications and features ([714985f](https://github.com/bleenco/abstruse/commit/714985f))
* **ui:** terminal themes ([9fd48a3](https://github.com/bleenco/abstruse/commit/9fd48a3))
* **ui:** updated styles for build details ([ce51290](https://github.com/bleenco/abstruse/commit/ce51290))
* adjustable terminal height ([633b030](https://github.com/bleenco/abstruse/commit/633b030))
* **vnc:** enables VNC for debugging ([f9cd1bd](https://github.com/bleenco/abstruse/commit/f9cd1bd))
* calculated time of previous build ([abc7cec](https://github.com/bleenco/abstruse/commit/abc7cec))
* collapse/expand commands log in terminal ([1544fb1](https://github.com/bleenco/abstruse/commit/1544fb1))
* list of previous build and job runs ([fd87f07](https://github.com/bleenco/abstruse/commit/fd87f07))
* update commit status on github ([ea00cf0](https://github.com/bleenco/abstruse/commit/ea00cf0))


### Performance Improvements

* **docker:** update default Dockerfile for abstruse image ([a23acf3](https://github.com/bleenco/abstruse/commit/a23acf3))
* **kill-container:** swithc from observable to promise when killing docker container ([d37a837](https://github.com/bleenco/abstruse/commit/d37a837))



<a name="0.8.8"></a>
## [0.8.8](https://github.com/bleenco/abstruse/compare/v0.6.0...v0.8.8) (2017-08-18)


### Bug Fixes

* **avatar:** fix path to default user avatarr ([d7b4380](https://github.com/bleenco/abstruse/commit/d7b4380))
* **console:** fix console output ([612a98e](https://github.com/bleenco/abstruse/commit/612a98e))
* **job:** fix job socket events ([788517f](https://github.com/bleenco/abstruse/commit/788517f))
* **process-manager:** catch promises, fix unworking things in pm ([a032e35](https://github.com/bleenco/abstruse/commit/a032e35))
* **regex:** fix terminal output regex ([547203b](https://github.com/bleenco/abstruse/commit/547203b))
* **setup:** docker image build fix ([59c9630](https://github.com/bleenco/abstruse/commit/59c9630))
* **terminal:** fix terminal output ([102ad37](https://github.com/bleenco/abstruse/commit/102ad37))
* **terminal:** fix terminal output ([f02d004](https://github.com/bleenco/abstruse/commit/f02d004))
* **terminal:** update terminal code ([35c073f](https://github.com/bleenco/abstruse/commit/35c073f))
* **tests:** fix e2e tests for protractor ([8f3600f](https://github.com/bleenco/abstruse/commit/8f3600f))
* **tests:** fix tests ([866d959](https://github.com/bleenco/abstruse/commit/866d959))
* bugfix, delete pr field before saveing build run ([fdcb60f](https://github.com/bleenco/abstruse/commit/fdcb60f))
* bugfixes ([e7768d0](https://github.com/bleenco/abstruse/commit/e7768d0))
* multiple fixes ([2da8c56](https://github.com/bleenco/abstruse/commit/2da8c56))
* **ui:** update ui accordingly ([099406f](https://github.com/bleenco/abstruse/commit/099406f))
* package-lock fix ([3ebba85](https://github.com/bleenco/abstruse/commit/3ebba85))
* show correct status of previous build run ([79009b4](https://github.com/bleenco/abstruse/commit/79009b4))
* status badges ([db34b0e](https://github.com/bleenco/abstruse/commit/db34b0e))
* update build end_time field when last job finish successfully and fix build time issue ([e0eb1df](https://github.com/bleenco/abstruse/commit/e0eb1df))


### Features

* **avatar:** default user avatar ([a07621e](https://github.com/bleenco/abstruse/commit/a07621e))
* **kill-container:** use more aggresive strategy to kill containers ([f95661b](https://github.com/bleenco/abstruse/commit/f95661b))
* **repositories:** search implementation ([613d1d6](https://github.com/bleenco/abstruse/commit/613d1d6))
* **sshd:** enable ssh into containers ([5dd7698](https://github.com/bleenco/abstruse/commit/5dd7698))
* **status-badges:** status badges ([9a40e91](https://github.com/bleenco/abstruse/commit/9a40e91))
* **team:** team component and route ([84ce5e0](https://github.com/bleenco/abstruse/commit/84ce5e0))
* **terminal:** scroller ([18a10f9](https://github.com/bleenco/abstruse/commit/18a10f9))
* **ui:** job details modifications and features ([714985f](https://github.com/bleenco/abstruse/commit/714985f))
* **ui:** terminal themes ([9fd48a3](https://github.com/bleenco/abstruse/commit/9fd48a3))
* **ui:** updated styles for build details ([ce51290](https://github.com/bleenco/abstruse/commit/ce51290))
* **vnc:** enables VNC for debugging ([f9cd1bd](https://github.com/bleenco/abstruse/commit/f9cd1bd))
* adjustable terminal height ([633b030](https://github.com/bleenco/abstruse/commit/633b030))
* calculated time of previous build ([abc7cec](https://github.com/bleenco/abstruse/commit/abc7cec))
* collapse/expand commands log in terminal ([1544fb1](https://github.com/bleenco/abstruse/commit/1544fb1))
* list of previous build and job runs ([fd87f07](https://github.com/bleenco/abstruse/commit/fd87f07))
* update commit status on github ([ea00cf0](https://github.com/bleenco/abstruse/commit/ea00cf0))


### Performance Improvements

* **docker:** update default Dockerfile for abstruse image ([a23acf3](https://github.com/bleenco/abstruse/commit/a23acf3))
* **kill-container:** swithc from observable to promise when killing docker container ([d37a837](https://github.com/bleenco/abstruse/commit/d37a837))



<a name="0.6.0"></a>
# 0.6.0 (2017-07-30)


### Bug Fixes

* do not require update on repository ([04e130c](https://github.com/bleenco/abstruse/commit/04e130c))
* init run with ensure root dir ([da217d2](https://github.com/bleenco/abstruse/commit/da217d2))
* multiple bugfixes ([37b040c](https://github.com/bleenco/abstruse/commit/37b040c))
* multiple pull_request webhooks fixes ([fbe06f8](https://github.com/bleenco/abstruse/commit/fbe06f8))
* multiple style fixes ([9cd716d](https://github.com/bleenco/abstruse/commit/9cd716d))
* return 400 if webhook event type is not supported ([ebf4571](https://github.com/bleenco/abstruse/commit/ebf4571))
* **process-manager:** multiple bug fixes ([3f63281](https://github.com/bleenco/abstruse/commit/3f63281))
* various fixes ([db5b075](https://github.com/bleenco/abstruse/commit/db5b075))
* various fixes ([354654c](https://github.com/bleenco/abstruse/commit/354654c))
* **builds:** fix build statuses and times ([641fc93](https://github.com/bleenco/abstruse/commit/641fc93))
* **builds-ui:** update builds status correctly and fix console output ([abf0bb8](https://github.com/bleenco/abstruse/commit/abf0bb8))
* **command:** fix command generation ([82a47f8](https://github.com/bleenco/abstruse/commit/82a47f8))
* **commands:** wrap commands in parenthesis ([138a292](https://github.com/bleenco/abstruse/commit/138a292))
* **login:** do not blink on successful login ([36b99c4](https://github.com/bleenco/abstruse/commit/36b99c4))
* **setup:** docker image preparation terminal fix ([39497e0](https://github.com/bleenco/abstruse/commit/39497e0))
* **setup:** skip docker image building if already done ([18c1942](https://github.com/bleenco/abstruse/commit/18c1942))
* **ssl:** correct paths from config ([9dea4df](https://github.com/bleenco/abstruse/commit/9dea4df))
* **trigger-build:** fix user and commit details when triggering new build ([003feb8](https://github.com/bleenco/abstruse/commit/003feb8))
* **ui:** multiple ui fixes ([3abd98e](https://github.com/bleenco/abstruse/commit/3abd98e))


### Features

* **api:** api routes for docker status ([b3e4f61](https://github.com/bleenco/abstruse/commit/b3e4f61))
* **api:** setup api ([8b89bf6](https://github.com/bleenco/abstruse/commit/8b89bf6))
* **auth:** change sessionStorage to localStorage ([750a283](https://github.com/bleenco/abstruse/commit/750a283))
* **auth:** switch to localStorage ([4a4ec98](https://github.com/bleenco/abstruse/commit/4a4ec98))
* **back:** back btn on job ([83ae734](https://github.com/bleenco/abstruse/commit/83ae734))
* **build:** stop build ([577c29c](https://github.com/bleenco/abstruse/commit/577c29c))
* **build:** ui design ([c0db3ec](https://github.com/bleenco/abstruse/commit/c0db3ec))
* **builds:** builds screen ([f704600](https://github.com/bleenco/abstruse/commit/f704600))
* **builds:** parallel jobs ([7c5ffcb](https://github.com/bleenco/abstruse/commit/7c5ffcb))
* **builds:** restart build ([08556ad](https://github.com/bleenco/abstruse/commit/08556ad))
* **config:** read concurrency from config file ([792038a](https://github.com/bleenco/abstruse/commit/792038a))
* **containers:** restart jobs ([6cd1e5b](https://github.com/bleenco/abstruse/commit/6cd1e5b))
* **db:** initialize database ([fa7ac04](https://github.com/bleenco/abstruse/commit/fa7ac04))
* **docker:** update dockerfile ([6214dff](https://github.com/bleenco/abstruse/commit/6214dff))
* **dropdown-menu:** ui dropdown menu in header ([e0a8e1b](https://github.com/bleenco/abstruse/commit/e0a8e1b))
* **favicon:** add favicon ([f10fc8e](https://github.com/bleenco/abstruse/commit/f10fc8e))
* **github:** github pull requests integration ([14a28ab](https://github.com/bleenco/abstruse/commit/14a28ab))
* **header:** header component ([be54870](https://github.com/bleenco/abstruse/commit/be54870))
* **header:** header navigation ui ([cce3f39](https://github.com/bleenco/abstruse/commit/cce3f39))
* **job:** build job modifications ([e994f2c](https://github.com/bleenco/abstruse/commit/e994f2c))
* **job:** job details init component ([dfde546](https://github.com/bleenco/abstruse/commit/dfde546))
* **job:** job server routes ([8212b70](https://github.com/bleenco/abstruse/commit/8212b70))
* **job:** output terminal data to web console ([fa4f901](https://github.com/bleenco/abstruse/commit/fa4f901))
* **job:** restart job ([e1022a4](https://github.com/bleenco/abstruse/commit/e1022a4))
* **job:** terminal output style ([66169fa](https://github.com/bleenco/abstruse/commit/66169fa))
* **jobs:** db model for jobs ([e341739](https://github.com/bleenco/abstruse/commit/e341739))
* **jobs:** language, language version, test_script ([7086e56](https://github.com/bleenco/abstruse/commit/7086e56))
* **list:** build history list ui ([8a341cc](https://github.com/bleenco/abstruse/commit/8a341cc))
* **loader:** place some nice loader while fetching ([1d1bc0b](https://github.com/bleenco/abstruse/commit/1d1bc0b))
* **loader:** show loader while fetching data ([1587170](https://github.com/bleenco/abstruse/commit/1587170))
* **loaders:** loader spinner + ton of stuff ([7dac97d](https://github.com/bleenco/abstruse/commit/7dac97d))
* **login:** login form ui ([2754fbb](https://github.com/bleenco/abstruse/commit/2754fbb))
* **login:** login implementation ([c8dd680](https://github.com/bleenco/abstruse/commit/c8dd680))
* **login:** login ui & component ([74b6214](https://github.com/bleenco/abstruse/commit/74b6214))
* **logout:** logout ([29c298e](https://github.com/bleenco/abstruse/commit/29c298e))
* **logs:** fix logging ([9dac3ed](https://github.com/bleenco/abstruse/commit/9dac3ed))
* **logs:** fix logs output ([a1cebe5](https://github.com/bleenco/abstruse/commit/a1cebe5))
* **nav:** nav bar ui ([18e450b](https://github.com/bleenco/abstruse/commit/18e450b))
* **notification:** notification styles ([a25a634](https://github.com/bleenco/abstruse/commit/a25a634))
* **notification-center:** main notifications ([53a6baa](https://github.com/bleenco/abstruse/commit/53a6baa))
* **pm:** process manager update ([3eca1db](https://github.com/bleenco/abstruse/commit/3eca1db))
* **pulsa:** pulsate effect ([276dc6c](https://github.com/bleenco/abstruse/commit/276dc6c))
* **queue:** implement build queue ([25bc5e7](https://github.com/bleenco/abstruse/commit/25bc5e7))
* **repo:** get repository details ([bf280bc](https://github.com/bleenco/abstruse/commit/bf280bc))
* **repos:** add repository ([c8e3229](https://github.com/bleenco/abstruse/commit/c8e3229))
* **repos:** no repositoriea message ([48977d2](https://github.com/bleenco/abstruse/commit/48977d2))
* **repos:** repositories list ([62d1dd4](https://github.com/bleenco/abstruse/commit/62d1dd4))
* **repos:** run new build ([5121c7e](https://github.com/bleenco/abstruse/commit/5121c7e))
* **repositorie:** repositories ([71b6cfb](https://github.com/bleenco/abstruse/commit/71b6cfb))
* **repositories:** run build btn functionality ([c697e01](https://github.com/bleenco/abstruse/commit/c697e01))
* **repositories-list:** status badges ([dd2265f](https://github.com/bleenco/abstruse/commit/dd2265f))
* **routes:** web routes ([8d58cdf](https://github.com/bleenco/abstruse/commit/8d58cdf))
* **safari:** safari style fixes ([e746e79](https://github.com/bleenco/abstruse/commit/e746e79))
* **scheduler:** implement scheduler ([0507dca](https://github.com/bleenco/abstruse/commit/0507dca))
* **security:** security and crypto api functions ([918c8ce](https://github.com/bleenco/abstruse/commit/918c8ce))
* **setup:** admin user register form ([efe976b](https://github.com/bleenco/abstruse/commit/efe976b))
* **setup:** check if database ready with initial admin ([922abec](https://github.com/bleenco/abstruse/commit/922abec))
* **setup:** initial setup screen + api ([f636893](https://github.com/bleenco/abstruse/commit/f636893))
* **setup:** latest setup changes ([afff6c9](https://github.com/bleenco/abstruse/commit/afff6c9))
* **setup:** setup screen UI ([b92b030](https://github.com/bleenco/abstruse/commit/b92b030))
* **setup:** user account ([fc03c5a](https://github.com/bleenco/abstruse/commit/fc03c5a))
* **setup:** user registration ([3ed8c8e](https://github.com/bleenco/abstruse/commit/3ed8c8e))
* **socket:** socket server ([a59fcf7](https://github.com/bleenco/abstruse/commit/a59fcf7))
* **spinner:** build spinner ([da39d65](https://github.com/bleenco/abstruse/commit/da39d65))
* **ssl:** wss ssl ([a6d6c0d](https://github.com/bleenco/abstruse/commit/a6d6c0d))
* **status-badge:** add repository status badge ([4722efa](https://github.com/bleenco/abstruse/commit/4722efa))
* **terminal:** terminal app component ([32ff7f7](https://github.com/bleenco/abstruse/commit/32ff7f7))
* **terminal:** terminal styling ([87f1447](https://github.com/bleenco/abstruse/commit/87f1447))
* **time:** date-fns helper lib for times ([e477c9b](https://github.com/bleenco/abstruse/commit/e477c9b))
* **time:** implements job live time ([292d484](https://github.com/bleenco/abstruse/commit/292d484))
* **times:** calculate build total time ([2231306](https://github.com/bleenco/abstruse/commit/2231306))
* **trigger-build:** trigger build after hook on github is added ([0d57d4c](https://github.com/bleenco/abstruse/commit/0d57d4c))
* **trigger-build:** trigger new build ui ([c5bbf68](https://github.com/bleenco/abstruse/commit/c5bbf68))
* **ui:** build details UI ([e04ff5a](https://github.com/bleenco/abstruse/commit/e04ff5a))
* **ui:** build details functionality ([a25b116](https://github.com/bleenco/abstruse/commit/a25b116))
* **ui:** build details stop / restart single job feature ([3ed9180](https://github.com/bleenco/abstruse/commit/3ed9180))
* **ui:** build list ([b6e6d0e](https://github.com/bleenco/abstruse/commit/b6e6d0e))
* **ui:** profile form ([9de529f](https://github.com/bleenco/abstruse/commit/9de529f))
* login button centered ([5c4a1cd](https://github.com/bleenco/abstruse/commit/5c4a1cd))
* process manager ([fad738f](https://github.com/bleenco/abstruse/commit/fad738f))
* restart build & stop ([3f0cbb7](https://github.com/bleenco/abstruse/commit/3f0cbb7))
* **webhooks:** github webhooks - pull request ([49c6813](https://github.com/bleenco/abstruse/commit/49c6813))
* unsubscribe on component destroy event ([68b00ab](https://github.com/bleenco/abstruse/commit/68b00ab))
* **ui:** commit details ([6af7bf9](https://github.com/bleenco/abstruse/commit/6af7bf9))
* **ui:** refactor ui look & feel ([9859d08](https://github.com/bleenco/abstruse/commit/9859d08))
* **ui:** repository details ([bc47d69](https://github.com/bleenco/abstruse/commit/bc47d69))
* **ui:** settings component ([a259c92](https://github.com/bleenco/abstruse/commit/a259c92))
* **ui:** stop & restart build implementation on builds page ([ca9ef88](https://github.com/bleenco/abstruse/commit/ca9ef88))
* **user-settings:** implement user settings and update password forms ([fb5bd60](https://github.com/bleenco/abstruse/commit/fb5bd60))
* **webhooks:** update webhooks and fix some tests ([9c01707](https://github.com/bleenco/abstruse/commit/9c01707))



