# Building a Java Project

## What This Guide Covers

This guide covers build environment and configuration topics specific to Java projects. Please make sure to read our Getting Started and general build configuration guides first.

## Table of Contents

- [OVERVIEW](#overview)
- [PROJECTS USING MAVEN](#projects-using-maven)
- [PROJECTS USING GRADLE](#projects-using-gradle)
- [PROJECTS USING ANT](#projects-using-ant)
- [TESTING AGAINST MULTIPLE JDKS](#testing-against-multiple-jdks)
- [BUILD MATRIX](#build-matrix)
- [SWITCHING JDKS WITHIN ONE JOB](#switching-jdks-within-one-job)

### Overview

The Abstruse CI environment provides Oracle JDK 8 (default), Oracle JDK 9, OpenJDK8, Maven 3.3, Gradle 3.2 and Ant 1.9.

To use the Java environment add the following to your `.abstruse.yml`:

```yml
language: java
```

### Projects Using Maven

#### Default script Command

If your project has `pom.xml` file in the repository root but no `build.gradle`, Abstruse CI build your project with Maven 3:

```sh
mvn test -B
```

If your project also includes the `mvnw` wrapper script in the repository root, Abstruse CI uses that instead:

```sh
./mvnw test -B
```

> The default command does not generate JavaDoc (`-Dmaven.javadoc.skip=true`)

#### Dependency Management

Before running the build, Abstruse CI installs dependencies:

```sh
mvn install -DskipTests=true -Dmaven.javadoc.skip=true -B -V
```

or if your project uses the `mvnw` wrapper script:

```sh
./mvnw install -DskipTests=true -Dmaven.javadoc.skip=true -B -V
```

### Projects Using Gradle

#### Default script Command

If your project has `build.gradle` file in the repository root, Abstruse CI builds your project with Gradle:

```sh
gradle check
```

If your project also includes the `gradlew` wrapper script in the repository root, Abstruse CI uses that instead:

```sh
./gradlew check
```

To use different build command, customize the build step.

#### Dependency Management

Before running the build, Abstruse CI installs dependencies

```sh
gradle assemble
```

or

```sh
./gradlew assemble
```

A peculiarity of dependency caching in Gradle means that to avoid uploading the cache after every build you need to add the following lines to your `.abstruse.yml`:

```yml
before_cache:
  - rm -f  $HOME/.gradle/caches/modules-2/modules-2.lock
  - rm -fr $HOME/.gradle/caches/*/plugin-resolution/
cache:
  directories:
    - $HOME/.gradle/caches/
    - $HOME/.gradle/wrapper/
```

#### Gradle daemon is disabled by default

As recommended by the Gradle team, the Gradle daemon is disabled by default. If you would like to run `gradle` with daemon, add `--daemon` to the invocation`

### Projects Using Ant

#### Default script Command

If Abstruse CI does not detect Maven or Gradle files it runs Ant:

```sh
ant test
```

#### Dependency Management

Because there is no single standard way of installing project dependencies with Ant, you need to specify the exact command to run using install: key in your `.abstruse.yml`, for example

```yml
language: java
install: ant deps
```

### Testing Against Multiple JDKs

To test against multiple JDKs, use the `jdk:` key in `.abstruse.yml`. For example, to test against Oracle JDK 8 and 9 and OpenJDK 8:

```yml
jdk:
  - oraclejdk8
  - oraclejdk9
  - openjdk8
```

Note: OracleJDK 9 and JavaFX projects may need to update to the latest available version from a repository. This can be accomplished by adding the following lines to your `.abstruse.yml`:

```yml
addons:
  apt:
    packages:
      - oracle-java9-installer
```

### Build Matrix

For Java projects, `env` and `jdk` can be given as arrays to construct a build matrix.

### Switching JDKs Within One Job

If your build needs to switch JDKs during a job, you can do so with `jdk_switcher …`.

```yml
script:
  - jdk_switcher oraclejdk8
  - # do stuff with Java 8
  - jdk_switcher oraclejdk9
  - # do stuff with Java 9
```

Use of `jdk_switcher` also updates `$JAVA_HOME` appropriately.
