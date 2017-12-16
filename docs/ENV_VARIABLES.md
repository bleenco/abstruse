# Environment Variables

A common way to customize the build process is to define environment variables, which can be accessed from any stage in your build process.

### Public ENV variables reference

- `ABSTRUSE_BRANCH`
  - for push builds, or builds not triggered by a pull request, this is the name of the branch.
  - for builds triggered by a pull request this is the name of the branch targeted by the pull request.
  - for builds triggered by a tag, this is the same as the name of the tag (`ABSTRUSE_TAG`)

- `ABSTRUSE_BUILD_DIR`
  - The absolute path to the directory where the repository being built has been copied on the worker.

- `ABSTRUSE_BUILD_ID`
  - The id of the current build that Abstruse CI uses internally.

- `ABSTRUSE_JOB_ID`
   - The if of the current job that Abstruse CI uses internally.

- `ABSTRUSE_COMMIT`
   - The commit that the current build is testing.

- `ABSTRUSE_EVENT_TYPE`
   - Indicates how the build was triggered. One of `push` or `pull_request`

- `ABSTRUSE_PULL_REQUEST`
   - The pull request number if the current job is a pull request, “false” if it’s not a pull request.

- `ABSTRUSE_PULL_REQUEST_BRANCH`
   - if the current job is a pull request, the name of the branch from which the PR originated.
   - if the current job is a push build, this variable is empty (`""`)

- `ABSTRUSE_TAG`
   -  If the current build is for a git tag, this variable is set to the tag’s name.

- `ABSTRUSE_PULL_REQUEST_SHA`
   - if the current job is a pull request, the commit SHA of the HEAD commit of the PR.
   - if the current job is a push build, this variable is empty (`""`)

- `ABSTRUSE_SECURE_ENV_VARS`
   - Set to `true` if there are any encrypted environment variables.
   - Set to `false` if no encrypted environment variables are available.

- `ABSTRUSE_TEST_RESULT`
   - is set to `0` if the build is successful and `1-255` if the build is broken.
   - this variable is available only since `test` command is executed

### Define public ENV variables in .abstruse.yml

You can define multiple ENV variables per item.

```yml
matrix:
  - env: SCRIPT=lint NODE_VERSION=8
  - env: SCRIPT=test NODE_VERSION=8
  - env: SCRIPT=test:e2e NODE_VERSION=8
  - env: SCRIPT=test:protractor NODE_VERSION=8
  - env: SCRIPT=test:karma NODE_VERSION=8
```

### Define variables public and encrypted variables under repository

Variables defined in repository settings are the same for all builds, and when you restart an old build, it uses the latest values. These variables are not automatically available to forks.

Define variables in the Repository Settings that:

- differ per repository.
- contain sensitive data, such as third-party credentials (encrypted variables).

<img src="https://user-images.githubusercontent.com/1796022/34071301-9d4e4d04-e274-11e7-8be7-57f411d3f93f.png">
