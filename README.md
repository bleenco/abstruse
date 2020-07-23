<p align="center" style="margin: 20px 0 40px 0;">
  <img height="80" src="https://user-images.githubusercontent.com/1796022/87736445-6b94d200-c7d8-11ea-8f98-fb0d5bf87081.png" />
</p>

# abstruse

[![Slack](https://slackin-xxrlxvwnmd.now.sh/badge.svg)](https://join.slack.com/t/abstruse/shared_invite/enQtNDI0MzUxMTQ1OTExLTMyNGRiYjllMTQ4NjkzZDkwNDM4NGIwMGM2YjA5NjFmNzI3MzdkMWExYWRlNWQ1N2NjNzI4NDlhOTFmNGM5ZTM)

Distributed Continuous Integration Platform.

This is a work in progress for v2.0.0 relase, if you are looking Node.JS based v1.x.x version please check [here](https://github.com/bleenco/abstruse/tree/v1).

![Screenshot](https://user-images.githubusercontent.com/1796022/87736550-af87d700-c7d8-11ea-9e9a-c23c2b5e02d1.png)

## Get Demo Running

If you are interested of the current status, the easiest way to get abstruse running is:

```sh
$ make docker
$ docker-compose -f configs/demo/default/docker-compose.yml up -d
```

this runs `abstruse-server` with single worker node `abstruse-worker` and MySQL database.
You should be able to connect on http://localhost:4400 and finish the setup wizard.

## Building the project from source

To build the project from source, first clone or download repository, then:

```sh
$ make install_dependencies
$ make
```

This will build the UI and all the commands.

## Development

If you are interested to help and contribute with the new release, you can get development environment running like;

```sh
$ make install_dependencies
```

This will install dependencies for building the project, note that you need `Node.JS`, `yarn` and `go` installed. All versions preferably latest.

For UI development you then run:

```sh
$ cd web/abstruse
$ yarn start
```

For `abstruse-server` development with live-reload enabled you run:

```sh
$ make dev
```

And for `abstruse-worker` development with live-reload you run:

```sh
$ make dev_worker
```

## License

MIT
