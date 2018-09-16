## Installation

### Table of Contents

* [Docker Image](#docker-image)
* [Notice on non amd64](#non-amd64)
* [Install From Npm](#install-from-npm)
* [Run From Source](#run-from-source)
* [Run Test Builds](#run-test-builds)

### Docker Image

1. Pull Docker Image

```sh
docker pull bleenco/abstruse
```

2. Make directory on host where configuration and database will be stored (not mandatory)

```sh
mkdir ~/abstruse-config
```

2. Run Image

```sh
docker run -dit --restart always -v /var/run/docker.sock:/var/run/docker.sock -v ~/abstruse-config:/root/abstruse -p 6500:6500 bleenco/abstruse
```

Note that we are exposing hosts `/var/run/docker.sock` to `abstruse` image. This is the only way you persist native `docker` performance.
All builds or jobs will actually run on the host.

You could also not expose `/var/run/docker.sock` to `abstruse` but performance will not be as it should be. At least we couldn't find appropriate
storage-driver or storage-driver combination that this will run with good performance. This will actually run docker-in-docker and please try to avoid
this while using `abstruse` docker image.

3. Open Application

Run your favorite `Chrome` browser and navigate to `http://localhost:6500`. You should see `abstruse` setup page which will guide you
throught the initial setup.

### Non amd64

Abstruse is intended to work on amd64 architectures, however, if you're willing to install abstruse on a rasp, odroid or any other kind of computer you have to tweak Dockerfile to target other architectures such as arm64 (aarch64) and so forth.

You can check this notes as a comments on https://github.com/bleenco/abstruse/blob/master/Dockerfile

### Install From npm

Note: This requires `node` version >= `6.x.x` installed on your host. We advise you that you run latest version of node.

```sh
$ npm install abstruse -g
```

After the installation, running a server is as easy as running the following command:

```sh
$ abstruse
```

### Run From Source

```sh
git clone https://github.com/bleenco/abstruse.git
cd abstruse
npm install
```

Then open two terminal instances and in the first run:

```sh
npm run dev # this compiles and run API
```

in the second instance run:

```sh
npm start # this will build UI part of the application and open browser at http://localhost:8000
```

### Run Test Builds

After you got everything up and running, you can trigger some test builds that are stored in `tests/dev-scripts/`, i.e.

```sh
node ./tests/dev-scripts/push-d3.js
```
