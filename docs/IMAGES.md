# Abstruse CI Images

**For running builds Docker Image is required.**

During the process of Abstruse installation, a new Docker Image with name `abstruse_builder` is built. This Image provides Abstruse
with all of the necessary data to run builds.

Each config file `.abstruse.yml` in your repository must start with line `image: "name_of_abstruse_image"`, where `"name_of_abstruse_image"` represents
Docker image that was build with Abstruse (otherwise it won't work). Every time, when a new build is triggered, a new clean environment is created from this Abstruse image.

In Abstruse we have two types of Docker images, `Base Images` and `Custom Images`.

## Base Images

Like we mentioned before, Abstruse Base Image provides a correctly configured environment for Abstruse, to run tests.

Abstruse Base Image `abstruse_builder` is built during Abstruse setup process, which means that when you log in for the first time this image
should be ready or in `building` mode (usually it takes few minutes for Docker to build image).

The differences between Base Images and Custom Images is that Base Images includes only necessary data for running builds while Custom Images
can include much more.

Base Image is generated from official Docker image `ubuntu:17.10` and added a few commands that are required for Abstruse to run properly
(generating local user, expose required ports, etc).

Similar to Custom Image, Base Image can be edit too, but it's not recommended if you're not sure what you're doing.

## Custom Images

The main difference between custom image and the base image is that Custome Image is built from Base Image.

Custom images are useful for times when we want that our test environment has preconfigured something so it'll be ready when starting a new build.
For example, if we want to run tests in Java, the tests will require java development kit which is not included in base image, that means we have two options:
- we can add command for installing JDK in our `.abstruse.yml` file in `install` section
- we can build a custom image and add that command for installing JDK in image

But there is a huge differences between this two approaches. In first approach we'll install JDK before each build. Which means that if installing JDK takes five minutes, each build will be five minutes slower. While in the other approach (the one with custom image), JDK would be installed inside the image and
everytime the new build will start, the JDK package will already be available in it's environment. Which means that five minutes for installing JDK will be executed only once on building image and every build will be five minutes shorter.

To build a new custom image go to Images page and click on button `Build Image` in top right corner.
Now you'll see five elements:
1. Image name, where you select image name.
2. Image type, where you can select if you'll build custom or base image.
3. Base image, where you select from which base image you would like to build that custom image.
4. Dockerfile, an editor with commands for building docker image. The First two commands are predefined and necessary (`FROM image`, `COPY init.sh /home/abstruse/init.sh`), while the others can be modified using [Docker format](https://docs.docker.com/engine/reference/builder/#format "Dockerfile reference"). Other commands are predefined like an example to install `Chronium`, `nvm` `sqlite3` and `Docker` these commands can be deleted with no harm.
5. Init.sh, and editor with commands of scripts that should be loaded or static environment variables.

<p align="center">
  <img src="https://user-images.githubusercontent.com/8555269/32666047-8997d7d0-c636-11e7-843f-9fbd61a9860b.png" style="width: 85%">
</p>

When you complete all four steps you can click on button at the end right corner `Build Image`. The building process should start and you'll see a terminal with building log. When build is ended, you'll be redirected to page where you can see all Abstruse images.

**When the image is built you still need to select this image in the first line of your `.abstruse.yml` configuration.**
