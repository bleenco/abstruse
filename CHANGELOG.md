<a name="1.5.3"></a>
## [1.5.3](https://github.com/bleenco/abstruse/compare/v1.5.2...v1.5.3) (2018-04-05)


### Bug Fixes

* **platform-server:** change repository url ([1c4160b](https://github.com/bleenco/abstruse/commit/1c4160b)), closes [#350](https://github.com/bleenco/abstruse/issues/350)



<a name="1.5.2"></a>
## [1.5.2](https://github.com/bleenco/abstruse/compare/v1.5.1...v1.5.2) (2018-03-03)


### Bug Fixes

* **badges:** disable cache of build status badges (closes [#342](https://github.com/bleenco/abstruse/issues/342)) ([cbf5a9b](https://github.com/bleenco/abstruse/commit/cbf5a9b))



<a name="1.5.1"></a>
## [1.5.1](https://github.com/bleenco/abstruse/compare/v1.5.0...v1.5.1) (2018-02-24)


### Bug Fixes

* **memory-leak:** fix container statistics memory leak (unresolved promise) ([5410c33](https://github.com/bleenco/abstruse/commit/5410c33))



<a name="1.4.6"></a>
## [1.4.6](https://github.com/bleenco/abstruse/compare/v1.4.5...v1.4.6) (2018-01-22)


### Bug Fixes

* **permissions:** fix permissions on repository/builds section ([0d356f4](https://github.com/bleenco/abstruse/commit/0d356f4))



<a name="1.4.5"></a>
## [1.4.5](https://github.com/bleenco/abstruse/compare/v1.4.4...v1.4.5) (2018-01-10)


### Bug Fixes

* **terminal:** increase default 1000 numbers scrollback in terminal output ([6c3bc6a](https://github.com/bleenco/abstruse/commit/6c3bc6a))


### Features

* **logs:** added ability to view raw job logs ([276e7d3](https://github.com/bleenco/abstruse/commit/276e7d3))



<a name="1.4.4"></a>
## [1.4.4](https://github.com/bleenco/abstruse/compare/v1.4.3...v1.4.4) (2017-12-21)


### Bug Fixes

* **images:** keep image configurations if build fails (closes [#316](https://github.com/bleenco/abstruse/issues/316)) ([fb8e0cc](https://github.com/bleenco/abstruse/commit/fb8e0cc))
* **tests:** fix docker images protractor tests (closes [#319](https://github.com/bleenco/abstruse/issues/319)) ([e8b7d51](https://github.com/bleenco/abstruse/commit/e8b7d51))
* **tests:** fix images unit tests ([9ef5544](https://github.com/bleenco/abstruse/commit/9ef5544))
* **tokens:** remove access token ([86cd34a](https://github.com/bleenco/abstruse/commit/86cd34a))
* **variables:** hide sensitive data from terminal output (closes [#301](https://github.com/bleenco/abstruse/issues/301)) ([6cb71d9](https://github.com/bleenco/abstruse/commit/6cb71d9))



<a name="1.4.3"></a>
## [1.4.3](https://github.com/bleenco/abstruse/compare/v1.4.2...v1.4.3) (2017-12-16)


### Bug Fixes

* **console:** add safety to check job id before output to console ([92a393b](https://github.com/bleenco/abstruse/commit/92a393b))
* **deploy:** enable custom deploy or with predefined deploy providers (closes [#304](https://github.com/bleenco/abstruse/issues/304)) ([a0225bc](https://github.com/bleenco/abstruse/commit/a0225bc))
* **stats:** unsubscribe from stats subscription when leaving dashboard ([4b73041](https://github.com/bleenco/abstruse/commit/4b73041))


### Features

* **deploy:** support for deploy to AWS Elastic Beanstalk ([4913c2c](https://github.com/bleenco/abstruse/commit/4913c2c))
* **envs:** add abstruse defined ENV variables (closes [#311](https://github.com/bleenco/abstruse/issues/311)) ([717d78b](https://github.com/bleenco/abstruse/commit/717d78b))



<a name="1.4.2"></a>
## [1.4.2](https://github.com/bleenco/abstruse/compare/v1.4.1...v1.4.2) (2017-12-11)


### Features

* **fonts:** switch to SourceSansPro ([91278be](https://github.com/bleenco/abstruse/commit/91278be))



<a name="1.4.1"></a>
## [1.4.1](https://github.com/bleenco/abstruse/compare/v1.4.0...v1.4.1) (2017-12-09)


### Bug Fixes

* **entry:** fix container entry point to not output vnc and stuff logs ([d0b9d90](https://github.com/bleenco/abstruse/commit/d0b9d90))
* **sessions:** improve stavility of socket sessions ([bafd4f0](https://github.com/bleenco/abstruse/commit/bafd4f0))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/bleenco/abstruse/compare/v1.3.6...v1.4.0) (2017-12-04)


### Bug Fixes

* **containers:** remove killed containers ([b90e6df](https://github.com/bleenco/abstruse/commit/b90e6df))
* **socket:** fix build permissions on new triggered build appearing on UI ([6c25f23](https://github.com/bleenco/abstruse/commit/6c25f23))


### Features

* **deploy:** support for aws codeDeploy service ([252afd0](https://github.com/bleenco/abstruse/commit/252afd0))
* **deploy:** support for deploy to aws s3 ([f7b35b5](https://github.com/bleenco/abstruse/commit/f7b35b5))



<a name="1.3.6"></a>
## [1.3.6](https://github.com/bleenco/abstruse/compare/v1.3.5...v1.3.6) (2017-11-21)


### Bug Fixes

* **terminal:** fixed terminal output issue ([1753441](https://github.com/bleenco/abstruse/commit/1753441))


### Features

* **build-matrix:** allow to build jobs on specific image ([f24513b](https://github.com/bleenco/abstruse/commit/f24513b))
* **containers:** stop container gracefully before removing ([c04f8b4](https://github.com/bleenco/abstruse/commit/c04f8b4))


### Performance Improvements

* **jobs:** start & stop build jobs in parallel rather than in sequence ([c107585](https://github.com/bleenco/abstruse/commit/c107585))



<a name="1.3.5"></a>
## [1.3.5](https://github.com/bleenco/abstruse/compare/v1.3.1...v1.3.5) (2017-11-16)


### Bug Fixes

* **console:** console on Linux ([efd99d3](https://github.com/bleenco/abstruse/commit/efd99d3))
* **container:** stop container and cleanup after build properly ([ae6202e](https://github.com/bleenco/abstruse/commit/ae6202e))
* **docker:** stop container or kill if not going nice way ([925684d](https://github.com/bleenco/abstruse/commit/925684d))
* **header:** remove hardcoded avatar ([f1f6405](https://github.com/bleenco/abstruse/commit/f1f6405))
* **output:** fix terminal output issues ([e0fd26a](https://github.com/bleenco/abstruse/commit/e0fd26a))
* **terminal:** fix terminal output before terminal ready ([5ff62b9](https://github.com/bleenco/abstruse/commit/5ff62b9))
* **terminal:** terminal output before terminal ready ([c18a814](https://github.com/bleenco/abstruse/commit/c18a814))


### Features

* **API:** run API & Socket Server on same single port ([78fd624](https://github.com/bleenco/abstruse/commit/78fd624))
* **base-image:** build base image during setup process (closes [#277](https://github.com/bleenco/abstruse/issues/277)) ([ddebe08](https://github.com/bleenco/abstruse/commit/ddebe08))
* **base-image:** build base image during setup process (closes [#277](https://github.com/bleenco/abstruse/issues/277)) ([f0fdf78](https://github.com/bleenco/abstruse/commit/f0fdf78))
* **build:** output container information ([416560b](https://github.com/bleenco/abstruse/commit/416560b))
* **docker:** Add a post push hook to make sure the latest tag gets built. ([217071d](https://github.com/bleenco/abstruse/commit/217071d))
* **docker:** Added healthcheck to dockerfile ([5e46608](https://github.com/bleenco/abstruse/commit/5e46608))
* **docker:** Preliminary work for automated dockerhub builds. ([18c83af](https://github.com/bleenco/abstruse/commit/18c83af))
* **dockerfile:** Add build command to npm scripts. ([8ed216f](https://github.com/bleenco/abstruse/commit/8ed216f))
* **dockerfile:** Addition of dockerfile for building Abstruse image ([ae993ca](https://github.com/bleenco/abstruse/commit/ae993ca))
* **hterm:** hterm integration ([eac7aa4](https://github.com/bleenco/abstruse/commit/eac7aa4))
* **images:** removeing docker images ([92504d2](https://github.com/bleenco/abstruse/commit/92504d2))
* **xterm:** implementation of xterm terminal ([90521b5](https://github.com/bleenco/abstruse/commit/90521b5))


### Performance Improvements

* **container:** force remove container instead of graceful stop ([c9093fe](https://github.com/bleenco/abstruse/commit/c9093fe))



<a name="1.3.4"></a>
## [1.3.4](https://github.com/bleenco/abstruse/compare/v1.3.1...v1.3.4) (2017-11-16)


### Bug Fixes

* **console:** console on Linux ([efd99d3](https://github.com/bleenco/abstruse/commit/efd99d3))
* **container:** stop container and cleanup after build properly ([ae6202e](https://github.com/bleenco/abstruse/commit/ae6202e))
* **docker:** stop container or kill if not going nice way ([925684d](https://github.com/bleenco/abstruse/commit/925684d))
* **header:** remove hardcoded avatar ([f1f6405](https://github.com/bleenco/abstruse/commit/f1f6405))
* **output:** fix terminal output issues ([e0fd26a](https://github.com/bleenco/abstruse/commit/e0fd26a))
* **terminal:** fix terminal output before terminal ready ([5ff62b9](https://github.com/bleenco/abstruse/commit/5ff62b9))
* **terminal:** terminal output before terminal ready ([c18a814](https://github.com/bleenco/abstruse/commit/c18a814))


### Features

* **API:** run API & Socket Server on same single port ([78fd624](https://github.com/bleenco/abstruse/commit/78fd624))
* **base-image:** build base image during setup process (closes [#277](https://github.com/bleenco/abstruse/issues/277)) ([ddebe08](https://github.com/bleenco/abstruse/commit/ddebe08))
* **base-image:** build base image during setup process (closes [#277](https://github.com/bleenco/abstruse/issues/277)) ([f0fdf78](https://github.com/bleenco/abstruse/commit/f0fdf78))
* **build:** output container information ([416560b](https://github.com/bleenco/abstruse/commit/416560b))
* **docker:** Add a post push hook to make sure the latest tag gets built. ([217071d](https://github.com/bleenco/abstruse/commit/217071d))
* **docker:** Added healthcheck to dockerfile ([5e46608](https://github.com/bleenco/abstruse/commit/5e46608))
* **docker:** Preliminary work for automated dockerhub builds. ([18c83af](https://github.com/bleenco/abstruse/commit/18c83af))
* **dockerfile:** Add build command to npm scripts. ([8ed216f](https://github.com/bleenco/abstruse/commit/8ed216f))
* **dockerfile:** Addition of dockerfile for building Abstruse image ([ae993ca](https://github.com/bleenco/abstruse/commit/ae993ca))
* **hterm:** hterm integration ([eac7aa4](https://github.com/bleenco/abstruse/commit/eac7aa4))
* **images:** removeing docker images ([92504d2](https://github.com/bleenco/abstruse/commit/92504d2))
* **xterm:** implementation of xterm terminal ([90521b5](https://github.com/bleenco/abstruse/commit/90521b5))


### Performance Improvements

* **container:** force remove container instead of graceful stop ([c9093fe](https://github.com/bleenco/abstruse/commit/c9093fe))



<a name="1.3.4"></a>
## [1.3.4](https://github.com/bleenco/abstruse/compare/v1.3.3...v1.3.4) (2017-11-11)


### Bug Fixes

* **container:** stop container and cleanup after build properly ([d04e438](https://github.com/bleenco/abstruse/commit/d04e438))
* **terminal:** fix terminal output before terminal ready ([41317d9](https://github.com/bleenco/abstruse/commit/41317d9))


### Performance Improvements

* **container:** force remove container instead of graceful stop ([2e5e2af](https://github.com/bleenco/abstruse/commit/2e5e2af))



<a name="1.3.3"></a>
## [1.3.3](https://github.com/bleenco/abstruse/compare/v1.3.1...v1.3.3) (2017-11-11)


### Bug Fixes

* **console:** console on Linux ([efd99d3](https://github.com/bleenco/abstruse/commit/efd99d3))
* **docker:** stop container or kill if not going nice way ([925684d](https://github.com/bleenco/abstruse/commit/925684d))
* **header:** remove hardcoded avatar ([f1f6405](https://github.com/bleenco/abstruse/commit/f1f6405))
* **output:** fix terminal output issues ([e0fd26a](https://github.com/bleenco/abstruse/commit/e0fd26a))


### Features

* **API:** run API & Socket Server on same single port ([78fd624](https://github.com/bleenco/abstruse/commit/78fd624))
* **base-image:** build base image during setup process (closes [#277](https://github.com/bleenco/abstruse/issues/277)) ([f0fdf78](https://github.com/bleenco/abstruse/commit/f0fdf78))
* **build:** output container information ([416560b](https://github.com/bleenco/abstruse/commit/416560b))
* **docker:** Add a post push hook to make sure the latest tag gets built. ([217071d](https://github.com/bleenco/abstruse/commit/217071d))
* **docker:** Added healthcheck to dockerfile ([5e46608](https://github.com/bleenco/abstruse/commit/5e46608))
* **docker:** Preliminary work for automated dockerhub builds. ([18c83af](https://github.com/bleenco/abstruse/commit/18c83af))
* **dockerfile:** Add build command to npm scripts. ([8ed216f](https://github.com/bleenco/abstruse/commit/8ed216f))
* **dockerfile:** Addition of dockerfile for building Abstruse image ([ae993ca](https://github.com/bleenco/abstruse/commit/ae993ca))
* **hterm:** hterm integration ([eac7aa4](https://github.com/bleenco/abstruse/commit/eac7aa4))



<a name="1.3.2"></a>
## [1.3.2](https://github.com/bleenco/abstruse/compare/v1.3.1...v1.3.2) (2017-11-07)


### Bug Fixes

* **header:** remove hardcoded avatar ([f1f6405](https://github.com/bleenco/abstruse/commit/f1f6405))


### Features

* **API:** run API & Socket Server on same single port ([78fd624](https://github.com/bleenco/abstruse/commit/78fd624))



<a name="1.3.1"></a>
## [1.3.1](https://github.com/bleenco/abstruse/compare/v1.3.0...v1.3.1) (2017-11-06)

* **default-image**: update default `nameless_image` to ubuntu 17.10 and Chromium instead of Google Chrome

<a name="1.3.0"></a>
# [1.3.0](https://github.com/bleenco/abstruse/compare/v1.2.0...v1.3.0) (2017-11-06)


### Bug Fixes

* **colors:** fix button colors ([acb610c](https://github.com/bleenco/abstruse/commit/acb610c))
* **dashboard:** only show abstruse generated docker containers ([47fb3f1](https://github.com/bleenco/abstruse/commit/47fb3f1))
* **editor:** switch to monospace font in monaco editor ([25e3728](https://github.com/bleenco/abstruse/commit/25e3728))
* **fonts:** fix fonts paths ([5055d90](https://github.com/bleenco/abstruse/commit/5055d90))
* **permissions:** private repositories should be hidden if user don't have permissions (closes [#262](https://github.com/bleenco/abstruse/issues/262)) ([82c75bf](https://github.com/bleenco/abstruse/commit/82c75bf))
* **style:** header z-index ([ccc7af1](https://github.com/bleenco/abstruse/commit/ccc7af1))
* **style:** removed scrollbars from header ([651b88d](https://github.com/bleenco/abstruse/commit/651b88d))


### Features

* **debug:** stop execution when enter debug mode ([1343a9d](https://github.com/bleenco/abstruse/commit/1343a9d))
* **header:** header styles ([825fe04](https://github.com/bleenco/abstruse/commit/825fe04))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/bleenco/abstruse/compare/v1.1.0...v1.2.0) (2017-10-23)


### Bug Fixes

* **image:** fix default image docker permissions ([92fab44](https://github.com/bleenco/abstruse/commit/92fab44))
* **image-message:** adds error message to job output when image doesn't exists ([f53abf0](https://github.com/bleenco/abstruse/commit/f53abf0))
* **images:** add image build status to system log and show all builded images ([0626eb1](https://github.com/bleenco/abstruse/commit/0626eb1)), closes [#241](https://github.com/bleenco/abstruse/issues/241)
* **images:** fixed bug of not showing docker images ([7c79080](https://github.com/bleenco/abstruse/commit/7c79080)), closes [#242](https://github.com/bleenco/abstruse/issues/242)
* **readme:** corrected sentence in README ([aa76406](https://github.com/bleenco/abstruse/commit/aa76406))


### Features

* **config:** demo mode added to config ([40efd07](https://github.com/bleenco/abstruse/commit/40efd07))
* **deploy:** deploy commands must execute in extra job only if other jobs succeeded (closes [#230](https://github.com/bleenco/abstruse/issues/230)) ([3ff9b59](https://github.com/bleenco/abstruse/commit/3ff9b59))
* **ordering:** execute commands using correct priority order ([89e5cf6](https://github.com/bleenco/abstruse/commit/89e5cf6))
* **status:** check git installation (closes [#249](https://github.com/bleenco/abstruse/issues/249)) ([d389d6d](https://github.com/bleenco/abstruse/commit/d389d6d))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/bleenco/abstruse/compare/1.0.0-beta.1...1.1.0) (2017-10-13)


### Bug Fixes

* **builds:** return job failed status correctly, cleanup docker containers ([ae5b740](https://github.com/bleenco/abstruse/commit/ae5b740))
* **exposed-ports:** fix socket exposed ports ([d47193c](https://github.com/bleenco/abstruse/commit/d47193c))
* **image-builder:** fixes the stability of building images ([ee7609e](https://github.com/bleenco/abstruse/commit/ee7609e))
* **image-builder:** image builder fixes ([ac6f5f0](https://github.com/bleenco/abstruse/commit/ac6f5f0))
* **ping:** ping repositories with right provider and api url ([28806ba](https://github.com/bleenco/abstruse/commit/28806ba))
* **repository:** trigger new build and fetch latest build ([d1c4692](https://github.com/bleenco/abstruse/commit/d1c4692))
* **scrollbar:** fix double scrollbar on Windows ([b2d88f0](https://github.com/bleenco/abstruse/commit/b2d88f0))
* **terminal:** fix terminal output times ([6e2445b](https://github.com/bleenco/abstruse/commit/6e2445b))
* **terminal:** fix terminal spinner ([46b11bd](https://github.com/bleenco/abstruse/commit/46b11bd))
* **times:** fix commit and build start times ([1c9a0ea](https://github.com/bleenco/abstruse/commit/1c9a0ea))
* **ui:** various fixes ([ca25a32](https://github.com/bleenco/abstruse/commit/ca25a32))
* **unit-tests:** abstruse now have 5 entries in matrix for testing ([7257f24](https://github.com/bleenco/abstruse/commit/7257f24))
* auhentication required when adding new user ([abbd17b](https://github.com/bleenco/abstruse/commit/abbd17b))
* fixed issue with client indexes ([6ae0a0a](https://github.com/bleenco/abstruse/commit/6ae0a0a))
* progress bar ([b5e09ed](https://github.com/bleenco/abstruse/commit/b5e09ed))
* repository status badges ([6029393](https://github.com/bleenco/abstruse/commit/6029393))
* require server authentication for delicated requests ([2c3b7e5](https://github.com/bleenco/abstruse/commit/2c3b7e5))
* running times ([72f4d28](https://github.com/bleenco/abstruse/commit/72f4d28))
* show correct data when new tag is pushed ([5170aa4](https://github.com/bleenco/abstruse/commit/5170aa4))
* show private repositories on permissions tab ([f08d586](https://github.com/bleenco/abstruse/commit/f08d586))
* times on mobile view ([c3657e6](https://github.com/bleenco/abstruse/commit/c3657e6))


### Features

* change build time algorithm ([4ff60d3](https://github.com/bleenco/abstruse/commit/4ff60d3))
* **bitbucket:** bitbucket config integration ([14b1af4](https://github.com/bleenco/abstruse/commit/14b1af4))
* **cache:** make cache deletable from repository settings ([6e229d8](https://github.com/bleenco/abstruse/commit/6e229d8))
* **gogs-gitlab:** gitlab and gogs integrated back ([1e3fc0a](https://github.com/bleenco/abstruse/commit/1e3fc0a))
* **mobile:** mobile login, switch to desktop view ([a64aa5a](https://github.com/bleenco/abstruse/commit/a64aa5a))
* **version:** display abstruse version in header dropdown ([13fe0aa](https://github.com/bleenco/abstruse/commit/13fe0aa))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/bleenco/abstruse/compare/1.0.0-beta.1...1.0.0) (2017-10-05)


### Bug Fixes

* **builds:** return job failed status correctly, cleanup docker containers ([ae5b740](https://github.com/bleenco/abstruse/commit/ae5b740))
* **exposed-ports:** fix socket exposed ports ([d47193c](https://github.com/bleenco/abstruse/commit/d47193c))
* **image-builder:** fixes the stability of building images ([ee7609e](https://github.com/bleenco/abstruse/commit/ee7609e))
* **image-builder:** image builder fixes ([ac6f5f0](https://github.com/bleenco/abstruse/commit/ac6f5f0))
* **ping:** ping repositories with right provider and api url ([28806ba](https://github.com/bleenco/abstruse/commit/28806ba))
* auhentication required when adding new user ([abbd17b](https://github.com/bleenco/abstruse/commit/abbd17b))
* progress bar ([b5e09ed](https://github.com/bleenco/abstruse/commit/b5e09ed))
* **repository:** trigger new build and fetch latest build ([d1c4692](https://github.com/bleenco/abstruse/commit/d1c4692))
* **scrollbar:** fix double scrollbar on Windows ([b2d88f0](https://github.com/bleenco/abstruse/commit/b2d88f0))
* **terminal:** fix terminal output times ([6e2445b](https://github.com/bleenco/abstruse/commit/6e2445b))
* **terminal:** fix terminal spinner ([46b11bd](https://github.com/bleenco/abstruse/commit/46b11bd))
* **times:** fix commit and build start times ([1c9a0ea](https://github.com/bleenco/abstruse/commit/1c9a0ea))
* **ui:** various fixes ([ca25a32](https://github.com/bleenco/abstruse/commit/ca25a32))
* **unit-tests:** abstruse now have 5 entries in matrix for testing ([7257f24](https://github.com/bleenco/abstruse/commit/7257f24))
* require server authentication for delicated requests ([2c3b7e5](https://github.com/bleenco/abstruse/commit/2c3b7e5))
* running times ([72f4d28](https://github.com/bleenco/abstruse/commit/72f4d28))
* times on mobile view ([c3657e6](https://github.com/bleenco/abstruse/commit/c3657e6))


### Features

* change build time algorithm ([4ff60d3](https://github.com/bleenco/abstruse/commit/4ff60d3))
* **bitbucket:** bitbucket config integration ([14b1af4](https://github.com/bleenco/abstruse/commit/14b1af4))
* **cache:** make cache deletable from repository settings ([6e229d8](https://github.com/bleenco/abstruse/commit/6e229d8))
* **gogs-gitlab:** gitlab and gogs integrated back ([1e3fc0a](https://github.com/bleenco/abstruse/commit/1e3fc0a))
* **mobile:** mobile login, switch to desktop view ([a64aa5a](https://github.com/bleenco/abstruse/commit/a64aa5a))
* **version:** display abstruse version in header dropdown ([13fe0aa](https://github.com/bleenco/abstruse/commit/13fe0aa))



<a name="1.0.0-rc.1"></a>
# [1.0.0-rc.1](https://github.com/bleenco/abstruse/compare/1.0.0-beta.1...1.0.0-rc.1) (2017-10-04)


### Bug Fixes

* **builds:** return job failed status correctly, cleanup docker containers ([ae5b740](https://github.com/bleenco/abstruse/commit/ae5b740))
* **exposed-ports:** fix socket exposed ports ([d47193c](https://github.com/bleenco/abstruse/commit/d47193c))
* **image-builder:** fixes the stability of building images ([ee7609e](https://github.com/bleenco/abstruse/commit/ee7609e))
* **image-builder:** image builder fixes ([ac6f5f0](https://github.com/bleenco/abstruse/commit/ac6f5f0))
* **ping:** ping repositories with right provider and api url ([28806ba](https://github.com/bleenco/abstruse/commit/28806ba))
* auhentication required when adding new user ([abbd17b](https://github.com/bleenco/abstruse/commit/abbd17b))
* progress bar ([b5e09ed](https://github.com/bleenco/abstruse/commit/b5e09ed))
* **repository:** trigger new build and fetch latest build ([d1c4692](https://github.com/bleenco/abstruse/commit/d1c4692))
* **scrollbar:** fix double scrollbar on Windows ([b2d88f0](https://github.com/bleenco/abstruse/commit/b2d88f0))
* **terminal:** fix terminal output times ([6e2445b](https://github.com/bleenco/abstruse/commit/6e2445b))
* **terminal:** fix terminal spinner ([46b11bd](https://github.com/bleenco/abstruse/commit/46b11bd))
* **times:** fix commit and build start times ([1c9a0ea](https://github.com/bleenco/abstruse/commit/1c9a0ea))
* **ui:** various fixes ([ca25a32](https://github.com/bleenco/abstruse/commit/ca25a32))
* **unit-tests:** abstruse now have 5 entries in matrix for testing ([7257f24](https://github.com/bleenco/abstruse/commit/7257f24))
* require server authentication for delicated requests ([2c3b7e5](https://github.com/bleenco/abstruse/commit/2c3b7e5))
* running times ([72f4d28](https://github.com/bleenco/abstruse/commit/72f4d28))
* times on mobile view ([c3657e6](https://github.com/bleenco/abstruse/commit/c3657e6))


### Features

* change build time algorithm ([4ff60d3](https://github.com/bleenco/abstruse/commit/4ff60d3))
* **bitbucket:** bitbucket config integration ([14b1af4](https://github.com/bleenco/abstruse/commit/14b1af4))
* **cache:** make cache deletable from repository settings ([6e229d8](https://github.com/bleenco/abstruse/commit/6e229d8))
* **gogs-gitlab:** gitlab and gogs integrated back ([1e3fc0a](https://github.com/bleenco/abstruse/commit/1e3fc0a))
* **mobile:** mobile login, switch to desktop view ([a64aa5a](https://github.com/bleenco/abstruse/commit/a64aa5a))
* **version:** display abstruse version in header dropdown ([13fe0aa](https://github.com/bleenco/abstruse/commit/13fe0aa))



<a name="1.0.0-beta.6"></a>
# [1.0.0-beta.6](https://github.com/bleenco/abstruse/compare/1.0.0-beta.1...1.0.0-beta.6) (2017-09-27)


### Bug Fixes

* **builds:** return job failed status correctly, cleanup docker containers ([ae5b740](https://github.com/bleenco/abstruse/commit/ae5b740))
* **exposed-ports:** fix socket exposed ports ([d47193c](https://github.com/bleenco/abstruse/commit/d47193c))
* **repository:** trigger new build and fetch latest build ([d1c4692](https://github.com/bleenco/abstruse/commit/d1c4692))
* **times:** fix commit and build start times ([1c9a0ea](https://github.com/bleenco/abstruse/commit/1c9a0ea))
* progress bar ([b5e09ed](https://github.com/bleenco/abstruse/commit/b5e09ed))
* running times ([72f4d28](https://github.com/bleenco/abstruse/commit/72f4d28))


### Features

* **cache:** make cache deletable from repository settings ([6e229d8](https://github.com/bleenco/abstruse/commit/6e229d8))



<a name="1.0.0-beta.5"></a>
# [1.0.0-beta.5](https://github.com/bleenco/abstruse/compare/1.0.0-beta.1...1.0.0-beta.5) (2017-09-25)


### Bug Fixes

* **builds:** return job failed status correctly, cleanup docker containers ([ae5b740](https://github.com/bleenco/abstruse/commit/ae5b740))
* **exposed-ports:** fix socket exposed ports ([d47193c](https://github.com/bleenco/abstruse/commit/d47193c))
* **repository:** trigger new build and fetch latest build ([d1c4692](https://github.com/bleenco/abstruse/commit/d1c4692))
* **times:** fix commit and build start times ([1c9a0ea](https://github.com/bleenco/abstruse/commit/1c9a0ea))
* progress bar ([b5e09ed](https://github.com/bleenco/abstruse/commit/b5e09ed))
* running times ([72f4d28](https://github.com/bleenco/abstruse/commit/72f4d28))


### Features

* **cache:** make cache deletable from repository settings ([6e229d8](https://github.com/bleenco/abstruse/commit/6e229d8))



<a name="1.0.0-beta.4"></a>
# [1.0.0-beta.4](https://github.com/bleenco/abstruse/compare/1.0.0-beta.1...1.0.0-beta.4) (2017-09-24)


### Bug Fixes

* running times ([72f4d28](https://github.com/bleenco/abstruse/commit/72f4d28))
* **builds:** return job failed status correctly, cleanup docker containers ([ae5b740](https://github.com/bleenco/abstruse/commit/ae5b740))
* **exposed-ports:** fix socket exposed ports ([d47193c](https://github.com/bleenco/abstruse/commit/d47193c))
* **repository:** trigger new build and fetch latest build ([d1c4692](https://github.com/bleenco/abstruse/commit/d1c4692))
* **times:** fix commit and build start times ([1c9a0ea](https://github.com/bleenco/abstruse/commit/1c9a0ea))


### Features

* **cache:** make cache deletable from repository settings ([6e229d8](https://github.com/bleenco/abstruse/commit/6e229d8))



<a name="1.0.0-beta.2"></a>
# [1.0.0-beta.2](https://github.com/bleenco/abstruse/compare/1.0.0-beta.1...1.0.0-beta.2) (2017-09-24)


### Bug Fixes

* **exposed-ports:** fix socket exposed ports ([d47193c](https://github.com/bleenco/abstruse/commit/d47193c))
* **repository:** trigger new build and fetch latest build ([d1c4692](https://github.com/bleenco/abstruse/commit/d1c4692))
* **times:** fix commit and build start times ([1c9a0ea](https://github.com/bleenco/abstruse/commit/1c9a0ea))
* running times ([72f4d28](https://github.com/bleenco/abstruse/commit/72f4d28))


### Features

* **cache:** make cache deletable from repository settings ([0962a1a](https://github.com/bleenco/abstruse/commit/0962a1a))



<a name="1.0.0-beta.1"></a>
# [1.0.0-beta.1](https://github.com/bleenco/abstruse/compare/v0.8.16...v1.0.0-beta.1) (2017-09-21)


### Bug Fixes

* **auto-scroll:** terminal output auto-scroll done right ([9855270](https://github.com/bleenco/abstruse/commit/9855270))
* **avatars:** hotfix for non PRs ([3e8b291](https://github.com/bleenco/abstruse/commit/3e8b291))
* **branch:** fix branch name ([1bf8b70](https://github.com/bleenco/abstruse/commit/1bf8b70))
* **build:** fix abstruse-pty program ([d2e58a1](https://github.com/bleenco/abstruse/commit/d2e58a1))
* **builds:** fix all job time execution and caching ([0c65b25](https://github.com/bleenco/abstruse/commit/0c65b25))
* **builds:** stop container (kill) on done ([249ffaf](https://github.com/bleenco/abstruse/commit/249ffaf))
* **cache:** fix cache paths ([13dd052](https://github.com/bleenco/abstruse/commit/13dd052))
* **cache:** fix directory existence checking ([7c91c85](https://github.com/bleenco/abstruse/commit/7c91c85))
* **chrome:** add security options and env vars so Google Chrome runs inside containers ([8631aac](https://github.com/bleenco/abstruse/commit/8631aac))
* **committer-name:** fix texts related to commiter and author name ([cc1281e](https://github.com/bleenco/abstruse/commit/cc1281e))
* **docker-stream:** parse statistics for docker containers properly ([361d216](https://github.com/bleenco/abstruse/commit/361d216))
* **dockerode:** fix privileged container config ([26a5fd4](https://github.com/bleenco/abstruse/commit/26a5fd4))
* **dockerode:** fix stopping container ([5690e1d](https://github.com/bleenco/abstruse/commit/5690e1d))
* **encryption:** do not generate keys each time starting server ([c73dc2b](https://github.com/bleenco/abstruse/commit/c73dc2b))
* add authentication token to update permission call ([60d0eec](https://github.com/bleenco/abstruse/commit/60d0eec))
* **github-status:** fix sending statuses to Github (closes [#102](https://github.com/bleenco/abstruse/issues/102)) ([0c2ec11](https://github.com/bleenco/abstruse/commit/0c2ec11))
* **hotfix:** fix blinking terminal ([6b244c5](https://github.com/bleenco/abstruse/commit/6b244c5))
* **hotfix:** hot hot hot ([e98d75f](https://github.com/bleenco/abstruse/commit/e98d75f))
* **logs:** do not allow logger to emit prematurely (closes [#164](https://github.com/bleenco/abstruse/issues/164)) ([31796ba](https://github.com/bleenco/abstruse/commit/31796ba))
* **permissions:** remove uneeded AuthGuard, fix all permissions on all routes ([f23f952](https://github.com/bleenco/abstruse/commit/f23f952))
* **pm:** fix some process and pm related stuff ([7cf2c0b](https://github.com/bleenco/abstruse/commit/7cf2c0b))
* init db before starting server ([5ce3baa](https://github.com/bleenco/abstruse/commit/5ce3baa))
* **protractor:** disable others e2e tests than GitHubs ([e163a27](https://github.com/bleenco/abstruse/commit/e163a27))
* **routes:** fix routes to monaco-editor source ([529ed9e](https://github.com/bleenco/abstruse/commit/529ed9e))
* fixed sending commit status ([66cb7f2](https://github.com/bleenco/abstruse/commit/66cb7f2))
* **timeout:** return observable ([85e024d](https://github.com/bleenco/abstruse/commit/85e024d))
* **times:** fix times on console output ([4e574cd](https://github.com/bleenco/abstruse/commit/4e574cd))
* **ui:** fix white ui ([1107122](https://github.com/bleenco/abstruse/commit/1107122))
* **ui:** ui style updates ([646926f](https://github.com/bleenco/abstruse/commit/646926f))
* **work-tree:** fix work-tree dir when checking out new sha/pr ([dd20c75](https://github.com/bleenco/abstruse/commit/dd20c75))
* fixed access guard ([ec4019f](https://github.com/bleenco/abstruse/commit/ec4019f))
* fixed build running time ([83dd607](https://github.com/bleenco/abstruse/commit/83dd607))
* fixed progress bar ([38cee0e](https://github.com/bleenco/abstruse/commit/38cee0e))
* restricted access to private repositories, builds and jobs ([40f5ca7](https://github.com/bleenco/abstruse/commit/40f5ca7))
* update build's end_time ([783ac43](https://github.com/bleenco/abstruse/commit/783ac43))


### Features

* **avatars:** double avatars where needed (closes [#109](https://github.com/bleenco/abstruse/issues/109)) ([cb5cc88](https://github.com/bleenco/abstruse/commit/cb5cc88))
* **branches:** get config from proper sha ([9e5dc03](https://github.com/bleenco/abstruse/commit/9e5dc03))
* **cache:** enable caching files and directories (closes [#132](https://github.com/bleenco/abstruse/issues/132)) ([1610146](https://github.com/bleenco/abstruse/commit/1610146))
* **config:** branches property ([2d80141](https://github.com/bleenco/abstruse/commit/2d80141))
* **config:** build config - generate jobs and envs ([f297a42](https://github.com/bleenco/abstruse/commit/f297a42))
* **console:** console command exec times ([2611e4f](https://github.com/bleenco/abstruse/commit/2611e4f))
* **dashboard:** containers live data ([f3a4655](https://github.com/bleenco/abstruse/commit/f3a4655))
* **dashboard:** cpu usage, run jobs statistics ([5307093](https://github.com/bleenco/abstruse/commit/5307093))
* **dashboard:** cpu utilization by core ([f6f54f0](https://github.com/bleenco/abstruse/commit/f6f54f0))
* **dashboard:** updates ([a157be6](https://github.com/bleenco/abstruse/commit/a157be6))
* **docker:** bash script for switching JDKs ([c8b5b23](https://github.com/bleenco/abstruse/commit/c8b5b23))
* **dockerode:** dockerode ([b713cba](https://github.com/bleenco/abstruse/commit/b713cba))
* **dockerode:** dockerode integration ([f581320](https://github.com/bleenco/abstruse/commit/f581320))
* **exec-script:** bash script for executing commands in container with timeout ([60fac21](https://github.com/bleenco/abstruse/commit/60fac21))
* **exec-script:** execute script ([75a3383](https://github.com/bleenco/abstruse/commit/75a3383))
* **images:** editing existing images ([94842ae](https://github.com/bleenco/abstruse/commit/94842ae))
* **images:** image builder ([c03c1ce](https://github.com/bleenco/abstruse/commit/c03c1ce))
* **jobs:** clipboard, ssh and vnc daemon ([afae6af](https://github.com/bleenco/abstruse/commit/afae6af))
* **line-chart:** initial line-chart ([2c9be48](https://github.com/bleenco/abstruse/commit/2c9be48))
* **logger:** enable logger to database ([dced1fe](https://github.com/bleenco/abstruse/commit/dced1fe))
* **logs:** system logs ([32af36a](https://github.com/bleenco/abstruse/commit/32af36a))
* **memory:** add ability to limit memory (RAM) limit per job ([9d4f01e](https://github.com/bleenco/abstruse/commit/9d4f01e))
* **mobile:** mobile styles ([70ccb53](https://github.com/bleenco/abstruse/commit/70ccb53))
* **notification:** implement live notifications (closes [#128](https://github.com/bleenco/abstruse/issues/128)) ([af04c8e](https://github.com/bleenco/abstruse/commit/af04c8e))
* **process:** handling process with the new script ([5872b35](https://github.com/bleenco/abstruse/commit/5872b35))
* **setup:** update setup and setup related e2e tests ([d716a3a](https://github.com/bleenco/abstruse/commit/d716a3a))
* **slimscroll:** implement slimscroll in console output ([9620379](https://github.com/bleenco/abstruse/commit/9620379))
* **socket:** enable session parsing for socket connections ([31d6c1f](https://github.com/bleenco/abstruse/commit/31d6c1f))
* **terminal:** roboto mono font ([353ae28](https://github.com/bleenco/abstruse/commit/353ae28))
* **ui:** dashboard init component ([1740ab6](https://github.com/bleenco/abstruse/commit/1740ab6))
* **ui:** image builder ([5934043](https://github.com/bleenco/abstruse/commit/5934043))
* **ui:** images UI ([0ea81b4](https://github.com/bleenco/abstruse/commit/0ea81b4))
* **ui:** notifications dropdown ([2a19784](https://github.com/bleenco/abstruse/commit/2a19784))
* repository environment variables ([f6cdf8d](https://github.com/bleenco/abstruse/commit/f6cdf8d))
* **ui:** progress bar ([110bf6a](https://github.com/bleenco/abstruse/commit/110bf6a))
* abstruse-cli ([e73ffda](https://github.com/bleenco/abstruse/commit/e73ffda))
* added encrypt and decrypt functions to cli ([01a6888](https://github.com/bleenco/abstruse/commit/01a6888))
* cloning of github private repository ([704fe27](https://github.com/bleenco/abstruse/commit/704fe27))
* command timeout ([641d3fd](https://github.com/bleenco/abstruse/commit/641d3fd))
* **usage:** memory usage ([02f06b2](https://github.com/bleenco/abstruse/commit/02f06b2))
* decrypt encrypted environment variables ([e96b95f](https://github.com/bleenco/abstruse/commit/e96b95f))
* generates private and public rsa key and store them to config ([5715dd0](https://github.com/bleenco/abstruse/commit/5715dd0))
* ssh and vnc ([e7a4395](https://github.com/bleenco/abstruse/commit/e7a4395))
* stop old, deprecated builds ([284abcd](https://github.com/bleenco/abstruse/commit/284abcd))
* **ui:** show proper branch ([df0884f](https://github.com/bleenco/abstruse/commit/df0884f))
* **ui:** show proper branch ([92cc505](https://github.com/bleenco/abstruse/commit/92cc505))
* **ui:** white ([9510417](https://github.com/bleenco/abstruse/commit/9510417))
* **ui-labels:** data-labels ([a1af711](https://github.com/bleenco/abstruse/commit/a1af711))



<a name="0.9.8"></a>
## [0.9.8](https://github.com/bleenco/abstruse/compare/v0.8.16...v0.9.8) (2017-09-19)


### Bug Fixes

* **auto-scroll:** terminal output auto-scroll done right ([9855270](https://github.com/bleenco/abstruse/commit/9855270))
* **avatars:** hotfix for non PRs ([3e8b291](https://github.com/bleenco/abstruse/commit/3e8b291))
* **branch:** fix branch name ([1bf8b70](https://github.com/bleenco/abstruse/commit/1bf8b70))
* **build:** fix abstruse-pty program ([d2e58a1](https://github.com/bleenco/abstruse/commit/d2e58a1))
* **builds:** fix all job time execution and caching ([0c65b25](https://github.com/bleenco/abstruse/commit/0c65b25))
* **cache:** fix directory existence checking ([7c91c85](https://github.com/bleenco/abstruse/commit/7c91c85))
* **chrome:** add security options and env vars so Google Chrome runs inside containers ([8631aac](https://github.com/bleenco/abstruse/commit/8631aac))
* **committer-name:** fix texts related to commiter and author name ([cc1281e](https://github.com/bleenco/abstruse/commit/cc1281e))
* **dockerode:** fix stopping container ([5690e1d](https://github.com/bleenco/abstruse/commit/5690e1d))
* **encryption:** do not generate keys each time starting server ([c73dc2b](https://github.com/bleenco/abstruse/commit/c73dc2b))
* **github-status:** fix sending statuses to Github (closes [#102](https://github.com/bleenco/abstruse/issues/102)) ([0c2ec11](https://github.com/bleenco/abstruse/commit/0c2ec11))
* **hotfix:** fix blinking terminal ([6b244c5](https://github.com/bleenco/abstruse/commit/6b244c5))
* **hotfix:** hot hot hot ([e98d75f](https://github.com/bleenco/abstruse/commit/e98d75f))
* **logs:** do not allow logger to emit prematurely (closes [#164](https://github.com/bleenco/abstruse/issues/164)) ([31796ba](https://github.com/bleenco/abstruse/commit/31796ba))
* **permissions:** remove uneeded AuthGuard, fix all permissions on all routes ([f23f952](https://github.com/bleenco/abstruse/commit/f23f952))
* **pm:** fix some process and pm related stuff ([7cf2c0b](https://github.com/bleenco/abstruse/commit/7cf2c0b))
* **protractor:** disable others e2e tests than GitHubs ([e163a27](https://github.com/bleenco/abstruse/commit/e163a27))
* init db before starting server ([5ce3baa](https://github.com/bleenco/abstruse/commit/5ce3baa))
* **routes:** fix routes to monaco-editor source ([529ed9e](https://github.com/bleenco/abstruse/commit/529ed9e))
* **timeout:** return observable ([85e024d](https://github.com/bleenco/abstruse/commit/85e024d))
* **times:** fix times on console output ([4e574cd](https://github.com/bleenco/abstruse/commit/4e574cd))
* **ui:** fix white ui ([1107122](https://github.com/bleenco/abstruse/commit/1107122))
* **ui:** ui style updates ([646926f](https://github.com/bleenco/abstruse/commit/646926f))
* fixed sending commit status ([66cb7f2](https://github.com/bleenco/abstruse/commit/66cb7f2))
* **work-tree:** fix work-tree dir when checking out new sha/pr ([dd20c75](https://github.com/bleenco/abstruse/commit/dd20c75))
* add authentication token to update permission call ([60d0eec](https://github.com/bleenco/abstruse/commit/60d0eec))
* fixed access guard ([ec4019f](https://github.com/bleenco/abstruse/commit/ec4019f))
* fixed build running time ([83dd607](https://github.com/bleenco/abstruse/commit/83dd607))
* fixed progress bar ([38cee0e](https://github.com/bleenco/abstruse/commit/38cee0e))
* restricted access to private repositories, builds and jobs ([40f5ca7](https://github.com/bleenco/abstruse/commit/40f5ca7))
* update build's end_time ([783ac43](https://github.com/bleenco/abstruse/commit/783ac43))


### Features

* **avatars:** double avatars where needed (closes [#109](https://github.com/bleenco/abstruse/issues/109)) ([cb5cc88](https://github.com/bleenco/abstruse/commit/cb5cc88))
* **branches:** get config from proper sha ([9e5dc03](https://github.com/bleenco/abstruse/commit/9e5dc03))
* **cache:** enable caching files and directories (closes [#132](https://github.com/bleenco/abstruse/issues/132)) ([1610146](https://github.com/bleenco/abstruse/commit/1610146))
* **config:** branches property ([2d80141](https://github.com/bleenco/abstruse/commit/2d80141))
* **config:** build config - generate jobs and envs ([f297a42](https://github.com/bleenco/abstruse/commit/f297a42))
* **console:** console command exec times ([2611e4f](https://github.com/bleenco/abstruse/commit/2611e4f))
* **dashboard:** cpu usage, run jobs statistics ([5307093](https://github.com/bleenco/abstruse/commit/5307093))
* **dashboard:** cpu utilization by core ([f6f54f0](https://github.com/bleenco/abstruse/commit/f6f54f0))
* **dashboard:** updates ([a157be6](https://github.com/bleenco/abstruse/commit/a157be6))
* **docker:** bash script for switching JDKs ([c8b5b23](https://github.com/bleenco/abstruse/commit/c8b5b23))
* **dockerode:** dockerode ([b713cba](https://github.com/bleenco/abstruse/commit/b713cba))
* **dockerode:** dockerode integration ([f581320](https://github.com/bleenco/abstruse/commit/f581320))
* **exec-script:** bash script for executing commands in container with timeout ([60fac21](https://github.com/bleenco/abstruse/commit/60fac21))
* **exec-script:** execute script ([75a3383](https://github.com/bleenco/abstruse/commit/75a3383))
* **images:** image builder ([c03c1ce](https://github.com/bleenco/abstruse/commit/c03c1ce))
* **line-chart:** initial line-chart ([2c9be48](https://github.com/bleenco/abstruse/commit/2c9be48))
* **logger:** enable logger to database ([dced1fe](https://github.com/bleenco/abstruse/commit/dced1fe))
* **logs:** system logs ([32af36a](https://github.com/bleenco/abstruse/commit/32af36a))
* **mobile:** mobile styles ([70ccb53](https://github.com/bleenco/abstruse/commit/70ccb53))
* **notification:** implement live notifications (closes [#128](https://github.com/bleenco/abstruse/issues/128)) ([af04c8e](https://github.com/bleenco/abstruse/commit/af04c8e))
* **process:** handling process with the new script ([5872b35](https://github.com/bleenco/abstruse/commit/5872b35))
* **socket:** enable session parsing for socket connections ([31d6c1f](https://github.com/bleenco/abstruse/commit/31d6c1f))
* **terminal:** roboto mono font ([353ae28](https://github.com/bleenco/abstruse/commit/353ae28))
* **ui:** dashboard init component ([1740ab6](https://github.com/bleenco/abstruse/commit/1740ab6))
* **ui:** image builder ([5934043](https://github.com/bleenco/abstruse/commit/5934043))
* **ui:** notifications dropdown ([2a19784](https://github.com/bleenco/abstruse/commit/2a19784))
* **ui:** progress bar ([110bf6a](https://github.com/bleenco/abstruse/commit/110bf6a))
* **ui:** show proper branch ([92cc505](https://github.com/bleenco/abstruse/commit/92cc505))
* **ui:** show proper branch ([df0884f](https://github.com/bleenco/abstruse/commit/df0884f))
* abstruse-cli ([e73ffda](https://github.com/bleenco/abstruse/commit/e73ffda))
* **ui:** white ([9510417](https://github.com/bleenco/abstruse/commit/9510417))
* added encrypt and decrypt functions to cli ([01a6888](https://github.com/bleenco/abstruse/commit/01a6888))
* **ui-labels:** data-labels ([a1af711](https://github.com/bleenco/abstruse/commit/a1af711))
* **usage:** memory usage ([02f06b2](https://github.com/bleenco/abstruse/commit/02f06b2))
* cloning of github private repository ([704fe27](https://github.com/bleenco/abstruse/commit/704fe27))
* command timeout ([641d3fd](https://github.com/bleenco/abstruse/commit/641d3fd))
* decrypt encrypted environment variables ([e96b95f](https://github.com/bleenco/abstruse/commit/e96b95f))
* generates private and public rsa key and store them to config ([5715dd0](https://github.com/bleenco/abstruse/commit/5715dd0))
* repository environment variables ([f6cdf8d](https://github.com/bleenco/abstruse/commit/f6cdf8d))
* stop old, deprecated builds ([284abcd](https://github.com/bleenco/abstruse/commit/284abcd))



<a name="0.9.7"></a>
## [0.9.7](https://github.com/bleenco/abstruse/compare/v0.8.16...v0.9.7) (2017-09-15)


### Bug Fixes

* **auto-scroll:** terminal output auto-scroll done right ([9855270](https://github.com/bleenco/abstruse/commit/9855270))
* **avatars:** hotfix for non PRs ([3e8b291](https://github.com/bleenco/abstruse/commit/3e8b291))
* **branch:** fix branch name ([1bf8b70](https://github.com/bleenco/abstruse/commit/1bf8b70))
* fixed access guard ([ec4019f](https://github.com/bleenco/abstruse/commit/ec4019f))
* **builds:** fix all job time execution and caching ([0c65b25](https://github.com/bleenco/abstruse/commit/0c65b25))
* **cache:** fix directory existence checking ([7c91c85](https://github.com/bleenco/abstruse/commit/7c91c85))
* **chrome:** add security options and env vars so Google Chrome runs inside containers ([8631aac](https://github.com/bleenco/abstruse/commit/8631aac))
* **committer-name:** fix texts related to commiter and author name ([cc1281e](https://github.com/bleenco/abstruse/commit/cc1281e))
* **encryption:** do not generate keys each time starting server ([c73dc2b](https://github.com/bleenco/abstruse/commit/c73dc2b))
* **github-status:** fix sending statuses to Github (closes [#102](https://github.com/bleenco/abstruse/issues/102)) ([0c2ec11](https://github.com/bleenco/abstruse/commit/0c2ec11))
* **hotfix:** fix blinking terminal ([6b244c5](https://github.com/bleenco/abstruse/commit/6b244c5))
* **hotfix:** hot hot hot ([e98d75f](https://github.com/bleenco/abstruse/commit/e98d75f))
* **permissions:** remove uneeded AuthGuard, fix all permissions on all routes ([f23f952](https://github.com/bleenco/abstruse/commit/f23f952))
* **pm:** fix some process and pm related stuff ([7cf2c0b](https://github.com/bleenco/abstruse/commit/7cf2c0b))
* fixed build running time ([83dd607](https://github.com/bleenco/abstruse/commit/83dd607))
* **timeout:** return observable ([85e024d](https://github.com/bleenco/abstruse/commit/85e024d))
* **times:** fix times on console output ([4e574cd](https://github.com/bleenco/abstruse/commit/4e574cd))
* **ui:** fix white ui ([1107122](https://github.com/bleenco/abstruse/commit/1107122))
* **ui:** ui style updates ([646926f](https://github.com/bleenco/abstruse/commit/646926f))
* **work-tree:** fix work-tree dir when checking out new sha/pr ([dd20c75](https://github.com/bleenco/abstruse/commit/dd20c75))
* add authentication token to update permission call ([60d0eec](https://github.com/bleenco/abstruse/commit/60d0eec))
* fixed progress bar ([38cee0e](https://github.com/bleenco/abstruse/commit/38cee0e))
* fixed sending commit status ([66cb7f2](https://github.com/bleenco/abstruse/commit/66cb7f2))
* init db before starting server ([5ce3baa](https://github.com/bleenco/abstruse/commit/5ce3baa))
* restricted access to private repositories, builds and jobs ([40f5ca7](https://github.com/bleenco/abstruse/commit/40f5ca7))
* update build's end_time ([783ac43](https://github.com/bleenco/abstruse/commit/783ac43))


### Features

* **avatars:** double avatars where needed (closes [#109](https://github.com/bleenco/abstruse/issues/109)) ([cb5cc88](https://github.com/bleenco/abstruse/commit/cb5cc88))
* **branches:** get config from proper sha ([9e5dc03](https://github.com/bleenco/abstruse/commit/9e5dc03))
* **cache:** enable caching files and directories (closes [#132](https://github.com/bleenco/abstruse/issues/132)) ([1610146](https://github.com/bleenco/abstruse/commit/1610146))
* **config:** branches property ([2d80141](https://github.com/bleenco/abstruse/commit/2d80141))
* **config:** build config - generate jobs and envs ([f297a42](https://github.com/bleenco/abstruse/commit/f297a42))
* **console:** console command exec times ([2611e4f](https://github.com/bleenco/abstruse/commit/2611e4f))
* **dashboard:** cpu usage, run jobs statistics ([1b4da35](https://github.com/bleenco/abstruse/commit/1b4da35))
* **dashboard:** cpu utilization by core ([686495d](https://github.com/bleenco/abstruse/commit/686495d))
* generates private and public rsa key and store them to config ([5715dd0](https://github.com/bleenco/abstruse/commit/5715dd0))
* **dashboard:** updates ([52445f4](https://github.com/bleenco/abstruse/commit/52445f4))
* **docker:** bash script for switching JDKs ([c8b5b23](https://github.com/bleenco/abstruse/commit/c8b5b23))
* **exec-script:** bash script for executing commands in container with timeout ([60fac21](https://github.com/bleenco/abstruse/commit/60fac21))
* **line-chart:** initial line-chart ([4fc6a3d](https://github.com/bleenco/abstruse/commit/4fc6a3d))
* **logger:** enable logger to database ([dced1fe](https://github.com/bleenco/abstruse/commit/dced1fe))
* **logs:** system logs ([32af36a](https://github.com/bleenco/abstruse/commit/32af36a))
* **mobile:** mobile styles ([70ccb53](https://github.com/bleenco/abstruse/commit/70ccb53))
* **notification:** implement live notifications (closes [#128](https://github.com/bleenco/abstruse/issues/128)) ([af04c8e](https://github.com/bleenco/abstruse/commit/af04c8e))
* **process:** handling process with the new script ([5872b35](https://github.com/bleenco/abstruse/commit/5872b35))
* stop old, deprecated builds ([284abcd](https://github.com/bleenco/abstruse/commit/284abcd))
* **socket:** enable session parsing for socket connections ([31d6c1f](https://github.com/bleenco/abstruse/commit/31d6c1f))
* **terminal:** roboto mono font ([353ae28](https://github.com/bleenco/abstruse/commit/353ae28))
* **ui:** dashboard init component ([11cc0e3](https://github.com/bleenco/abstruse/commit/11cc0e3))
* **ui:** notifications dropdown ([2a19784](https://github.com/bleenco/abstruse/commit/2a19784))
* **ui:** progress bar ([110bf6a](https://github.com/bleenco/abstruse/commit/110bf6a))
* **ui:** show proper branch ([92cc505](https://github.com/bleenco/abstruse/commit/92cc505))
* **ui:** show proper branch ([df0884f](https://github.com/bleenco/abstruse/commit/df0884f))
* **ui:** white ([9510417](https://github.com/bleenco/abstruse/commit/9510417))
* abstruse-cli ([e73ffda](https://github.com/bleenco/abstruse/commit/e73ffda))
* **ui-labels:** data-labels ([a1af711](https://github.com/bleenco/abstruse/commit/a1af711))
* **usage:** memory usage ([2bca8ca](https://github.com/bleenco/abstruse/commit/2bca8ca))
* added encrypt and decrypt functions to cli ([01a6888](https://github.com/bleenco/abstruse/commit/01a6888))
* cloning of github private repository ([704fe27](https://github.com/bleenco/abstruse/commit/704fe27))
* command timeout ([641d3fd](https://github.com/bleenco/abstruse/commit/641d3fd))
* decrypt encrypted environment variables ([e96b95f](https://github.com/bleenco/abstruse/commit/e96b95f))
* repository environment variables ([f6cdf8d](https://github.com/bleenco/abstruse/commit/f6cdf8d))



<a name="0.9.6"></a>
## [0.9.6](https://github.com/bleenco/abstruse/compare/v0.8.16...v0.9.6) (2017-09-11)


### Bug Fixes

* **auto-scroll:** terminal output auto-scroll done right ([9855270](https://github.com/bleenco/abstruse/commit/9855270))
* **avatars:** hotfix for non PRs ([3e8b291](https://github.com/bleenco/abstruse/commit/3e8b291))
* **branch:** fix branch name ([1bf8b70](https://github.com/bleenco/abstruse/commit/1bf8b70))
* **chrome:** add security options and env vars so Google Chrome runs inside containers ([8631aac](https://github.com/bleenco/abstruse/commit/8631aac))
* **committer-name:** fix texts related to commiter and author name ([cc1281e](https://github.com/bleenco/abstruse/commit/cc1281e))
* **encryption:** do not generate keys each time starting server ([c73dc2b](https://github.com/bleenco/abstruse/commit/c73dc2b))
* add authentication token to update permission call ([60d0eec](https://github.com/bleenco/abstruse/commit/60d0eec))
=======
* add authentication token to update permission call ([60d0eec](https://github.com/bleenco/abstruse/commit/60d0eec))
* **cache:** fix directory existence checking ([3a37186](https://github.com/bleenco/abstruse/commit/3a37186))
* **chrome:** add security options and env vars so Google Chrome runs inside containers ([8631aac](https://github.com/bleenco/abstruse/commit/8631aac))
* init db before starting server ([5ce3baa](https://github.com/bleenco/abstruse/commit/5ce3baa))
* **committer-name:** fix texts related to commiter and author name ([cc1281e](https://github.com/bleenco/abstruse/commit/cc1281e))
* **encryption:** do not generate keys each time starting server ([c73dc2b](https://github.com/bleenco/abstruse/commit/c73dc2b))
* restricted access to private repositories, builds and jobs ([40f5ca7](https://github.com/bleenco/abstruse/commit/40f5ca7))
>>>>>>> chore(release): 0.9.6
* **github-status:** fix sending statuses to Github (closes [#102](https://github.com/bleenco/abstruse/issues/102)) ([0c2ec11](https://github.com/bleenco/abstruse/commit/0c2ec11))
* **hotfix:** fix blinking terminal ([6b244c5](https://github.com/bleenco/abstruse/commit/6b244c5))
* **hotfix:** hot hot hot ([e98d75f](https://github.com/bleenco/abstruse/commit/e98d75f))
* **permissions:** remove uneeded AuthGuard, fix all permissions on all routes ([f23f952](https://github.com/bleenco/abstruse/commit/f23f952))
* **pm:** fix some process and pm related stuff ([7cf2c0b](https://github.com/bleenco/abstruse/commit/7cf2c0b))
* **times:** fix times on console output ([4e574cd](https://github.com/bleenco/abstruse/commit/4e574cd))
* restricted access to private repositories, builds and jobs ([40f5ca7](https://github.com/bleenco/abstruse/commit/40f5ca7))
* **ui:** fix white ui ([1107122](https://github.com/bleenco/abstruse/commit/1107122))
* fixed access guard ([ec4019f](https://github.com/bleenco/abstruse/commit/ec4019f))
* **ui:** ui style updates ([646926f](https://github.com/bleenco/abstruse/commit/646926f))
* **work-tree:** fix work-tree dir when checking out new sha/pr ([dd20c75](https://github.com/bleenco/abstruse/commit/dd20c75))
* fixed build running time ([83dd607](https://github.com/bleenco/abstruse/commit/83dd607))
* fixed progress bar ([38cee0e](https://github.com/bleenco/abstruse/commit/38cee0e))
* fixed sending commit status ([66cb7f2](https://github.com/bleenco/abstruse/commit/66cb7f2))
* init db before starting server ([5ce3baa](https://github.com/bleenco/abstruse/commit/5ce3baa))
* update build's end_time ([783ac43](https://github.com/bleenco/abstruse/commit/783ac43))

### Features

* **avatars:** double avatars where needed (closes [#109](https://github.com/bleenco/abstruse/issues/109)) ([cb5cc88](https://github.com/bleenco/abstruse/commit/cb5cc88))
* **branches:** get config from proper sha ([9e5dc03](https://github.com/bleenco/abstruse/commit/9e5dc03))
* **cache:** enable caching files and directories (closes [#132](https://github.com/bleenco/abstruse/issues/132)) ([1610146](https://github.com/bleenco/abstruse/commit/1610146))
* **config:** branches property ([2d80141](https://github.com/bleenco/abstruse/commit/2d80141))
* **config:** build config - generate jobs and envs ([f297a42](https://github.com/bleenco/abstruse/commit/f297a42))
* **console:** console command exec times ([2611e4f](https://github.com/bleenco/abstruse/commit/2611e4f))
* **docker:** bash script for switching JDKs ([c8b5b23](https://github.com/bleenco/abstruse/commit/c8b5b23))
* **exec-script:** bash script for executing commands in container with timeout ([60fac21](https://github.com/bleenco/abstruse/commit/60fac21))
* **logger:** enable logger to database ([dced1fe](https://github.com/bleenco/abstruse/commit/dced1fe))
* **logs:** system logs ([32af36a](https://github.com/bleenco/abstruse/commit/32af36a))
* **process:** handling process with the new script ([5872b35](https://github.com/bleenco/abstruse/commit/5872b35))
* **socket:** enable session parsing for socket connections ([31d6c1f](https://github.com/bleenco/abstruse/commit/31d6c1f))
* stop old, deprecated builds ([284abcd](https://github.com/bleenco/abstruse/commit/284abcd))
* **terminal:** roboto mono font ([353ae28](https://github.com/bleenco/abstruse/commit/353ae28))
* **ui:** progress bar ([110bf6a](https://github.com/bleenco/abstruse/commit/110bf6a))
* **ui:** show proper branch ([df0884f](https://github.com/bleenco/abstruse/commit/df0884f))
* **ui:** show proper branch ([92cc505](https://github.com/bleenco/abstruse/commit/92cc505))
* **ui:** white ([9510417](https://github.com/bleenco/abstruse/commit/9510417))
* **ui-labels:** data-labels ([a1af711](https://github.com/bleenco/abstruse/commit/a1af711))
* abstruse-cli ([e73ffda](https://github.com/bleenco/abstruse/commit/e73ffda))
* added encrypt and decrypt functions to cli ([01a6888](https://github.com/bleenco/abstruse/commit/01a6888))
* cloning of github private repository ([704fe27](https://github.com/bleenco/abstruse/commit/704fe27))
* decrypt encrypted environment variables ([e96b95f](https://github.com/bleenco/abstruse/commit/e96b95f))
* generates private and public rsa key and store them to config ([5715dd0](https://github.com/bleenco/abstruse/commit/5715dd0))
* repository environment variables ([f6cdf8d](https://github.com/bleenco/abstruse/commit/f6cdf8d))



<a name="0.9.5"></a>
## [0.9.5](https://github.com/bleenco/abstruse/compare/v0.8.16...v0.9.5) (2017-09-11)


### Bug Fixes

* **auto-scroll:** terminal output auto-scroll done right ([9855270](https://github.com/bleenco/abstruse/commit/9855270))
* **avatars:** hotfix for non PRs ([3e8b291](https://github.com/bleenco/abstruse/commit/3e8b291))
* **branch:** fix branch name ([1bf8b70](https://github.com/bleenco/abstruse/commit/1bf8b70))
* **chrome:** add security options and env vars so Google Chrome runs inside containers ([8631aac](https://github.com/bleenco/abstruse/commit/8631aac))
* **committer-name:** fix texts related to commiter and author name ([cc1281e](https://github.com/bleenco/abstruse/commit/cc1281e))
* **encryption:** do not generate keys each time starting server ([c73dc2b](https://github.com/bleenco/abstruse/commit/c73dc2b))
* add authentication token to update permission call ([60d0eec](https://github.com/bleenco/abstruse/commit/60d0eec))
* **github-status:** fix sending statuses to Github (closes [#102](https://github.com/bleenco/abstruse/issues/102)) ([0c2ec11](https://github.com/bleenco/abstruse/commit/0c2ec11))
* **hotfix:** fix blinking terminal ([6b244c5](https://github.com/bleenco/abstruse/commit/6b244c5))
* **hotfix:** hot hot hot ([e98d75f](https://github.com/bleenco/abstruse/commit/e98d75f))
* **permissions:** remove uneeded AuthGuard, fix all permissions on all routes ([f23f952](https://github.com/bleenco/abstruse/commit/f23f952))
* **pm:** fix some process and pm related stuff ([7cf2c0b](https://github.com/bleenco/abstruse/commit/7cf2c0b))
* **times:** fix times on console output ([4e574cd](https://github.com/bleenco/abstruse/commit/4e574cd))
* restricted access to private repositories, builds and jobs ([40f5ca7](https://github.com/bleenco/abstruse/commit/40f5ca7))
* **ui:** fix white ui ([1107122](https://github.com/bleenco/abstruse/commit/1107122))
* fixed access guard ([ec4019f](https://github.com/bleenco/abstruse/commit/ec4019f))
* **ui:** ui style updates ([646926f](https://github.com/bleenco/abstruse/commit/646926f))
* **work-tree:** fix work-tree dir when checking out new sha/pr ([dd20c75](https://github.com/bleenco/abstruse/commit/dd20c75))
* fixed build running time ([83dd607](https://github.com/bleenco/abstruse/commit/83dd607))
* fixed progress bar ([38cee0e](https://github.com/bleenco/abstruse/commit/38cee0e))
* fixed sending commit status ([66cb7f2](https://github.com/bleenco/abstruse/commit/66cb7f2))
* init db before starting server ([5ce3baa](https://github.com/bleenco/abstruse/commit/5ce3baa))
* update build's end_time ([783ac43](https://github.com/bleenco/abstruse/commit/783ac43))


### Features

* **avatars:** double avatars where needed (closes [#109](https://github.com/bleenco/abstruse/issues/109)) ([cb5cc88](https://github.com/bleenco/abstruse/commit/cb5cc88))
* **branches:** get config from proper sha ([9e5dc03](https://github.com/bleenco/abstruse/commit/9e5dc03))
* **cache:** enable caching files and directories (closes [#132](https://github.com/bleenco/abstruse/issues/132)) ([1610146](https://github.com/bleenco/abstruse/commit/1610146))
* **config:** branches property ([2d80141](https://github.com/bleenco/abstruse/commit/2d80141))
* **config:** build config - generate jobs and envs ([f297a42](https://github.com/bleenco/abstruse/commit/f297a42))
* **console:** console command exec times ([2611e4f](https://github.com/bleenco/abstruse/commit/2611e4f))
* **docker:** bash script for switching JDKs ([c8b5b23](https://github.com/bleenco/abstruse/commit/c8b5b23))
* **exec-script:** bash script for executing commands in container with timeout ([60fac21](https://github.com/bleenco/abstruse/commit/60fac21))
* **logger:** enable logger to database ([dced1fe](https://github.com/bleenco/abstruse/commit/dced1fe))
* **logs:** system logs ([32af36a](https://github.com/bleenco/abstruse/commit/32af36a))
* **process:** handling process with the new script ([5872b35](https://github.com/bleenco/abstruse/commit/5872b35))
* **socket:** enable session parsing for socket connections ([31d6c1f](https://github.com/bleenco/abstruse/commit/31d6c1f))
* stop old, deprecated builds ([284abcd](https://github.com/bleenco/abstruse/commit/284abcd))
* **terminal:** roboto mono font ([353ae28](https://github.com/bleenco/abstruse/commit/353ae28))
* **ui:** progress bar ([110bf6a](https://github.com/bleenco/abstruse/commit/110bf6a))
* **ui:** show proper branch ([df0884f](https://github.com/bleenco/abstruse/commit/df0884f))
* **ui:** show proper branch ([92cc505](https://github.com/bleenco/abstruse/commit/92cc505))
* **ui:** white ([9510417](https://github.com/bleenco/abstruse/commit/9510417))
* **ui-labels:** data-labels ([a1af711](https://github.com/bleenco/abstruse/commit/a1af711))
* abstruse-cli ([e73ffda](https://github.com/bleenco/abstruse/commit/e73ffda))
* added encrypt and decrypt functions to cli ([01a6888](https://github.com/bleenco/abstruse/commit/01a6888))
* cloning of github private repository ([704fe27](https://github.com/bleenco/abstruse/commit/704fe27))
* decrypt encrypted environment variables ([e96b95f](https://github.com/bleenco/abstruse/commit/e96b95f))
* generates private and public rsa key and store them to config ([5715dd0](https://github.com/bleenco/abstruse/commit/5715dd0))
* repository environment variables ([f6cdf8d](https://github.com/bleenco/abstruse/commit/f6cdf8d))



<a name="0.9.4"></a>
## [0.9.4](https://github.com/bleenco/abstruse/compare/v0.8.16...v0.9.4) (2017-09-06)


### Bug Fixes

* **avatars:** hotfix for non PRs ([3e8b291](https://github.com/bleenco/abstruse/commit/3e8b291))
* **chrome:** add security options and env vars so Google Chrome runs inside containers ([8631aac](https://github.com/bleenco/abstruse/commit/8631aac))
* **github-status:** fix sending statuses to Github (closes [#102](https://github.com/bleenco/abstruse/issues/102)) ([0c2ec11](https://github.com/bleenco/abstruse/commit/0c2ec11))
* **hotfix:** fix blinking terminal ([6b244c5](https://github.com/bleenco/abstruse/commit/6b244c5))
* **hotfix:** hot hot hot ([e98d75f](https://github.com/bleenco/abstruse/commit/e98d75f))
* **permissions:** remove uneeded AuthGuard, fix all permissions on all routes ([f23f952](https://github.com/bleenco/abstruse/commit/f23f952))
* **pm:** fix some process and pm related stuff ([7cf2c0b](https://github.com/bleenco/abstruse/commit/7cf2c0b))
* **times:** fix times on console output ([4e574cd](https://github.com/bleenco/abstruse/commit/4e574cd))
* **ui:** ui style updates ([646926f](https://github.com/bleenco/abstruse/commit/646926f))
* add authentication token to update permission call ([60d0eec](https://github.com/bleenco/abstruse/commit/60d0eec))
* fixed access guard ([ec4019f](https://github.com/bleenco/abstruse/commit/ec4019f))
* fixed build running time ([83dd607](https://github.com/bleenco/abstruse/commit/83dd607))
* fixed progress bar ([38cee0e](https://github.com/bleenco/abstruse/commit/38cee0e))
* fixed sending commit status ([66cb7f2](https://github.com/bleenco/abstruse/commit/66cb7f2))
* init db before starting server ([5ce3baa](https://github.com/bleenco/abstruse/commit/5ce3baa))
* restricted access to private repositories, builds and jobs ([40f5ca7](https://github.com/bleenco/abstruse/commit/40f5ca7))
* update build's end_time ([783ac43](https://github.com/bleenco/abstruse/commit/783ac43))


### Features

* **avatars:** double avatars where needed (closes [#109](https://github.com/bleenco/abstruse/issues/109)) ([cb5cc88](https://github.com/bleenco/abstruse/commit/cb5cc88))
* **config:** branches property ([2d80141](https://github.com/bleenco/abstruse/commit/2d80141))
* **config:** build config - generate jobs and envs ([f297a42](https://github.com/bleenco/abstruse/commit/f297a42))
* **console:** console command exec times ([2611e4f](https://github.com/bleenco/abstruse/commit/2611e4f))
* cloning of github private repository ([704fe27](https://github.com/bleenco/abstruse/commit/704fe27))
* **docker:** bash script for switching JDKs ([c8b5b23](https://github.com/bleenco/abstruse/commit/c8b5b23))
* **exec-script:** bash script for executing commands in container with timeout ([60fac21](https://github.com/bleenco/abstruse/commit/60fac21))
* **logger:** enable logger to database ([dced1fe](https://github.com/bleenco/abstruse/commit/dced1fe))
* **process:** handling process with the new script ([5872b35](https://github.com/bleenco/abstruse/commit/5872b35))
* **socket:** enable session parsing for socket connections ([31d6c1f](https://github.com/bleenco/abstruse/commit/31d6c1f))
* **ui:** progress bar ([110bf6a](https://github.com/bleenco/abstruse/commit/110bf6a))
* **ui-labels:** data-labels ([a1af711](https://github.com/bleenco/abstruse/commit/a1af711))
* repository environment variables ([f6cdf8d](https://github.com/bleenco/abstruse/commit/f6cdf8d))
* stop old, deprecated builds ([284abcd](https://github.com/bleenco/abstruse/commit/284abcd))



<a name="0.9.3"></a>
## [0.9.3](https://github.com/bleenco/abstruse/compare/v0.8.16...v0.9.3) (2017-09-04)


### Bug Fixes

* **avatars:** hotfix for non PRs ([3e8b291](https://github.com/bleenco/abstruse/commit/3e8b291))
* **github-status:** fix sending statuses to Github (closes [#102](https://github.com/bleenco/abstruse/issues/102)) ([0c2ec11](https://github.com/bleenco/abstruse/commit/0c2ec11))
* **hotfix:** hot hot hot ([e98d75f](https://github.com/bleenco/abstruse/commit/e98d75f))
* fixed build running time ([83dd607](https://github.com/bleenco/abstruse/commit/83dd607))
* fixed progress bar ([38cee0e](https://github.com/bleenco/abstruse/commit/38cee0e))
* fixed sending commit status ([66cb7f2](https://github.com/bleenco/abstruse/commit/66cb7f2))
* **pm:** fix some process and pm related stuff ([7cf2c0b](https://github.com/bleenco/abstruse/commit/7cf2c0b))
* **ui:** ui style updates ([646926f](https://github.com/bleenco/abstruse/commit/646926f))
* init db before starting server ([5ce3baa](https://github.com/bleenco/abstruse/commit/5ce3baa))
* restricted access to private repositories, builds and jobs ([40f5ca7](https://github.com/bleenco/abstruse/commit/40f5ca7))


### Features

* **avatars:** double avatars where needed (closes [#109](https://github.com/bleenco/abstruse/issues/109)) ([cb5cc88](https://github.com/bleenco/abstruse/commit/cb5cc88))
* cloning of github private repository ([704fe27](https://github.com/bleenco/abstruse/commit/704fe27))
* **config:** branches property ([2d80141](https://github.com/bleenco/abstruse/commit/2d80141))
* **config:** build config - generate jobs and envs ([f297a42](https://github.com/bleenco/abstruse/commit/f297a42))
* **docker:** bash script for switching JDKs ([c8b5b23](https://github.com/bleenco/abstruse/commit/c8b5b23))
* **logger:** enable logger to database ([dced1fe](https://github.com/bleenco/abstruse/commit/dced1fe))
* **socket:** enable session parsing for socket connections ([31d6c1f](https://github.com/bleenco/abstruse/commit/31d6c1f))
* **ui:** progress bar ([110bf6a](https://github.com/bleenco/abstruse/commit/110bf6a))
* **ui-labels:** data-labels ([a1af711](https://github.com/bleenco/abstruse/commit/a1af711))



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



