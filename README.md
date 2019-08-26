<h1 align="center">
  <br>
  <br>
  <a href="https://github.com/bleenco/abstruse"><img src="https://user-images.githubusercontent.com/1796022/41514005-9e827b86-72a3-11e8-9ca5-67736d9cab3e.png" alt="abstruse continuous integration" width="300"></a>
  <br>
  <br>
</h1>

<h4 align="center">abstruse distributed continuous integration platform.</h4>

<br>

## Basic Overview

abstruse is parted on main `abstruse` server instance and multiple or single `abstruse-worker` instances.

## Building Abstruse from source

First, you need to install all dependencies

```sh
make install_dependencies
```

Build main `abstruse` program

```sh
make grpc && make
```

Build `abstruse-worker` program

```sh
make worker
```


<br>

![screenshot](https://user-images.githubusercontent.com/1796022/50724592-77d2a600-10f0-11e9-8253-f55319768460.png)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
