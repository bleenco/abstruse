FROM ubuntu:17.04

RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN echo 'export PS1="> "' > /root/.bashrc
RUN apt-get update && apt-get install -y curl apt-transport-https wget rsync apt-utils
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y build-essential ca-certificates git libssl-dev python xvfb fluxbox google-chrome-stable firefox sudo

RUN export CHROME_BIN=google-chrome-stable
COPY xvfb /etc/init.d/xvfb
RUN chmod a+x /etc/init.d/xvfb

RUN useradd -m abstruse
RUN usermod -aG sudo abstruse
RUN echo 'export PS1="> "' >> /home/abstruse/.bashrc
RUN echo '. /home/abstruse/.nvm/nvm.sh' >> /home/abstruse/.bashrc
RUN echo "abstruse ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER abstruse
RUN mkdir /home/abstruse/build
WORKDIR /home/abstruse/build

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash \
  && export NVM_DIR="$HOME/.nvm" \
  && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" \
  && source $NVM_DIR/nvm.sh \
  && nvm install node

EXPOSE 22 5900 5800
