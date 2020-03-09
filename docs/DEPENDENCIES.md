## Dependencies

`Abstruse` requires `sqlite3` and `Docker` to be installed.

### Contents

* [Ubuntu Linux](#ubuntu-linux)
* [MacOS](#macos)
* [Windows](#windows)


### Ubuntu Linux

1. Install Node.JS

There are many ways installing Node.JS on Ubuntu. We will use an approach where you can later update, uninstall or use another version of Node.JS easily.
First, make sure you have build-essential and libssl-dev installed.

```sh
sudo apt-get install build-essential libssl-dev -y
```

After you ran previous command and it has done with its work successfully its time to install nvm.

```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

This will load nvm in your current bash/zsh session. Now its finally time to install Node.JS:

```sh
nvm install node
```

2. Install sqlite3

```sh
sudo apt-get install sqlite3 -y
```

Check if installation was successful with running sqlite3 command.

3. Install Docker CE

```sh
curl -fsSL get.docker.com -o get-docker.sh
chmod +x get-docker.sh
sudo ./get-docker.sh
```

After script is done with its work add your user to the docker group. This will allow you running Docker containers with your user and not only root. janez stands for your username.

```sh
sudo usermod -aG docker $USER
```

After this you need to open a new terminal where groups are populated again. There's no other way than opening new terminal/tab.

You can check if your user is in docker group with running.

```sh
id
```

If docker group is listed, you are on a good way. If not, check previous commands again.

Finally, start the Docker instance with running.

```sh
sudo /etc/init.d/docker start
```

### MacOS

This guide presumes you have brew command available. If not, quickly install it with.

```sh
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

...it also presumes that you have CommandLineTools installed.

```sh
xcode-select --install
```

1. Install Node.JS

There are other ways of installing Node.JS on MacOS, we will use more convenient one.

```sh
brew install node
```

2. Install sqlite3

Also, for sqlite3, we will use similar approach and use brew again.

```sh
brew install sqlite3
```

3. Install Docker

To install Docker on MacOS, download it from here and open Docker.dmg file. You will be guided through the installation and really there is not something that you can miss.
