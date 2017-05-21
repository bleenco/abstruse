FROM ubuntu:17.04

RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN echo 'export PS1="> "' > /root/.bashrc
RUN apt-get update && apt-get install -y curl apt-transport-https apt-utils
RUN apt-get update && apt-get install -y \
  build-essential \
  ca-certificates \
  git \
  libssl-dev \
  python \
  rsync \
  software-properties-common \
  vim \
  wget \
  xvfb \
  chromium-browser \
  fluxbox

COPY xvfb /etc/init.d/xvfb
RUN chmod a+x /etc/init.d/xvfb
RUN /etc/init.d/xvfb start && sleep 3 && fluxbox &

RUN export DISPLAY=:99
RUN export CHROME_BIN=chromium-browser

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash \
  && export NVM_DIR="$HOME/.nvm" \
  && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" \
  && source $NVM_DIR/nvm.sh \
  && nvm install node
