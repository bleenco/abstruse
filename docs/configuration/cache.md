# Caching Dependencies and Directories

- [Caching Directories (Bundler, dependencies)](#caching-directories-bundler-dependencies)
- [Things not to cache](#things-not-to-cache)
- [Configuration](#configuration)

Abstruse CI can cache content that does not often change, to speed up your build process. To use the caching feature, in your repository settings, set caching to ON.

- Abstruse CI fetches the cache for every build, including branches and pull requests.
- If a branch does not have its own cache, Travis CI fetches the master branch cache.
- There is one cache per branch and language version/ compiler version/ JDK version/ Gemfile location/ etc.
- Only modifications made to the cached directories from normal pushes are stored.

> Please note that cache content is available to any build on the repository,
> including Pull Requests, so make sure you do not put any sensitive information in the cache.

## Caching Directories (Bundler, dependencies)

Caches lets Abstruse CI store directories between builds, which is useful for storing dependencies that take longer to compile or download.

#### Build phases

Abstruse CI stores the cache after the `script` phase of the build, but before either `after_success` or `after_failure`.

#### Bundler

On Ruby projects, installing dependencies via Bundler can make up a large portion of the build duration.
Caching the bundle between builds drastically reduces the time a build takes to run.

##### Enabling Bundler caching

To enable Bundler caching in your `.abstruse.yml`:

```yml
language: ruby
cache: bundler
```

This will set up `vendor/bundle` directory to be cached. If you have directory configured on different
location, use `cache.directories` in that case.

When you use

```yml
cache: bundler
```

The command `bundle clean` is executed before the cache is stored.

##### yarn cache

For caching with `yarn`, use:

```yml
language: node_js
node_js: '8' # or another
cache: yarn
```

This caches `$HOME/.cache/yarn`.

##### pip cache

For caching `pip` files, use:

```yml
language: python
cache: pip
```

caches `$HOME/.cache/pip`.

##### ccache cache

If you are using ccache, use:

```yml
language: c # or other C/C++ variants
cache: ccache
```

to cache `$HOME/.ccache` and automatically add `/usr/lib/ccache` to your `$PATH`.

##### R package cache

For caching R packages, use:

```yml
language: R
cache: packages
```

This caches `$HOME/R/Library`, and sets `R_LIB_USER=$HOME/R/Library` environment variable.

#### Rust Cargo cache

For caching Cargo packages, use:

```yml
language: rust
cache: cargo
```

This caches `$HOME/.cargo` and `$ABSTRUSE_BUILD_DIR/target`.

Arbitrary directories

You can cache arbitrary directories, such as Gradle, Maven, Composer and npm cache directories,
between builds by listing them in your `.abstruse.yml`:

```yml
cache:
  directories:
    - .autoconf
    - $HOME/.m2
```

As you can see, you can use environment variables as part of the directory path. After possible variable expansion, paths that

- do not start with a `/` are relative to `$ABSTRUSE_BUILD_DIR`.
- start with a `/` are absolute.

Please be aware thgat the `abstruse` user needs to have write permissions to this directory.

## Things not to cache

The cache’s purpose is to make installing language-specific dependencies easy and fast, so
everything related to tools like Bundler, pip, Composer, npm, Gradle, Maven, is what should go into the cache.

Large files that are quick to install but slow to download do not benefit from caching,
as they take as long to download from the cache as from the original source:

- Android SDKs
- Debian packages
- JDK packages
- Compiled binaries
- Docker images
