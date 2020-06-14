<p align="center">
  <img height="60" src="https://user-images.githubusercontent.com/1796022/82115620-33373000-9764-11ea-9ce2-78a9ebeb05a1.png">
</p>

## Status

This project is a work in progress, if you have time to contribute you are very welcome.

Please check [Makefile](Makefile) in order to build up the project.

For preview [check demo video.](https://youtu.be/WJ7_hqhiStY)

## Quick Start

For a quick preview you can run:

```sh
git clone https://github.com/jkuri/abstruse2
cd abstruse2
make compose
```

then login on `http://localhost` with username `john@example.com` and `johndoe` as password.

To build docker images from master branch you can run

```sh
make docker && make compose
```

This starts `abstruse-server` with one `abstruse-worker` for testing purposes.

## License

MIT
