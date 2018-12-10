FROM mhart/alpine-node:10 as build

ARG APP_ROOT=/app
ARG VCS_REF=n/a
ARG VERSION=dev
ARG BUILD_DATE=n/a

WORKDIR $APP_ROOT

LABEL maintainer="Jan Kuri <jan@bleenco.com>" \
  org.label-schema.schema-version="1.0" \
  org.label-schema.name="abstruse" \
  org.label-schema.description="Continuous integration platform, simple, scalable and fast" \
  org.label-schema.url="https://abstruse.bleenco.io/" \
  org.label-schema.vcs-url="https://github.com/bleenco/abstruse" \
  org.label-schema.vendor="Bleenco" \
  org.label-schema.vcs-ref=$VCS_REF \
  org.label-schema.version=$VERSION \
  org.label-schema.build-date=$BUILD_DATE

ENV ARCH=x86_64
ENV DOCKER_VERSION=18.03.1-ce

RUN apk add \
  --no-cache \
  --virtual build-dependencies \
  openssl && \
  wget https://download.docker.com/linux/static/stable/$ARCH/docker-$DOCKER_VERSION.tgz -O /tmp/docker.tgz && \
  mkdir /tmp/docker && tar xzf /tmp/docker.tgz -C /tmp && \
  mv /tmp/docker/docker /usr/bin/docker && \
  chmod 755 /usr/bin/docker

# Development dependencies
RUN apk add \
  --no-cache \
  --virtual build-dependencies \
  curl \
  g++ \
  gcc \
  git \
  make \
  sqlite \
  python

# Production dependencies
RUN apk add \
  --no-cache \
  bash \
  git \
  sqlite \
  tini \
  wget

# NPM dependencies
COPY package.json package-lock.json $APP_ROOT/

RUN npm install --only=production && \
  cp -R node_modules prod_node_modules && \
  npm install

# Copy shared files
COPY tsconfig.json $APP_ROOT

# Copy frontend
COPY angular.json $APP_ROOT
COPY src/environments $APP_ROOT/src/environments
COPY src/app $APP_ROOT/src/app
COPY src/assets $APP_ROOT/src/assets
COPY src/styles $APP_ROOT/src/styles
COPY src/testing $APP_ROOT/src/testing

COPY src/index.html \
  src/main.ts \
  src/polyfills.ts \
  src/test.ts \
  src/tsconfig.app.json \
  src/tsconfig.spec.json \
  src/typings.d.ts \
  $APP_ROOT/src/

# Build frontend
RUN npm run build:app

# Copy backend dependencies
COPY src/files/docker-essential/fluxbox /etc/init.d/
COPY src/files/docker-essential/x11vnc /etc/init.d/
COPY src/files/docker-essential/xvfb /etc/init.d/
COPY src/files/docker-essential/entry.sh /
COPY src/files/docker-essential/abstruse-pty-amd64 /usr/bin/abstruse-pty
RUN chmod +x /entry.sh /etc/init.d/* /usr/bin/abstruse*

# Copy backend
COPY webpack.api.js $APP_ROOT
COPY src/api $APP_ROOT/src/api
COPY src/files $APP_ROOT/src/files
COPY src/tsconfig.api.json $APP_ROOT/src

# Build backend
RUN npm run build

# Restore production node_modules
RUN rm -rf node_modules && \
  mv prod_node_modules node_modules

# Remove files not required for production
RUN apk del build-dependencies && \
  rm -rf src && \
  rm -rf /tmp/*

HEALTHCHECK --interval=10s --timeout=2s --start-period=20s \
  CMD wget -q -O- http://localhost:6500/status || exit 1

EXPOSE 6500

ENTRYPOINT ["/sbin/tini", "--"]
CMD [ "node", "dist/api/index.js" ]
