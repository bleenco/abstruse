<p align="center" style="margin: 20px 0 40px 0;">
  <img height="80" src="https://user-images.githubusercontent.com/1796022/87736445-6b94d200-c7d8-11ea-8f98-fb0d5bf87081.png" />
</p>

# Abstruse CI

[![Discord](https://img.shields.io/discord/786173138181685248.svg?logo=discord&logoColor=fff&label=Discord&color=7389d8)](https://discord.gg/dfDXn8dPEA)
[![Go Report Card](https://goreportcard.com/badge/github.com/bleenco/abstruse)](https://goreportcard.com/report/github.com/bleenco/abstruse)

**Abstruse CI** is a lightweight, yet powerful distributed CI/CD written in Golang. Its default configuration uses single node cluster with n workers, however, this cluster can be easily extended with more nodes if necessary.

This is the branch for v2.0.0 or later. If you are looking for Node.JS based v1.x.x version please check [here](https://github.com/bleenco/abstruse/tree/v1).

![Screenshot](https://user-images.githubusercontent.com/1796022/87736550-af87d700-c7d8-11ea-9e9a-c23c2b5e02d1.png)

## Check Out Live Demo

Go to https://ci.abstruse.cc and login with username `demo@bleenco.com` and password `abstruse`.

Note: A demo user has only read permissions and can't add new repositories.

## Get the Demo Running Locally

If you are interested about the status of this project, the easiest way to get Abstruse 2.x running is:

```sh
$ docker-compose -f https://raw.githubusercontent.com/bleenco/abstruse/master/configs/demo/default/docker-compose.yml up -d
```
You can also build docker images locally:

```sh
$ make docker
$ docker-compose -f configs/demo/default/docker-compose.yml up -d
```

This command will run `abstruse-server` with a single worker node `abstruse-worker` and MySQL database.
You should be able to open up the installation wizard in your browser at http://localhost and finish the setup.

## Building the Project from Source

To build the project from source, first clone or download repository, then:

```sh
$ make install_dependencies
$ make
```

## Development

If you are interested in helping with the new release, you can get the development environment running like:

```sh
$ make install_dependencies
```

This will install all dependencies for building the project. Please note that you need `Node.JS`, `yarn` and `go` installed, preferably latest releases.

For UI development run:

```sh
$ cd web/abstruse
$ yarn start
```

For `abstruse-server` development with live-reload enabled run:

```sh
$ make dev
```

And for `abstruse-worker` development with live-reload run:

```sh
$ make dev_worker
```

## License

See the [license](https://github.com/irmana/abstruse/blob/master/LICENSE).
