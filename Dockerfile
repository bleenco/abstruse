FROM mhart/alpine-node:8.9.0 as build

ARG APP_ROOT=/opt/abstruse
ARG VCS_REF=n/a
ARG VERSION=dev
ARG BUILD_DATE=n/a

ENV APP_ROOT $APP_ROOT
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
  --repository http://dl-cdn.alpinelinux.org/alpine/latest-stable/community \
  bash \
  docker \
  git \
  sqlite \
  tini \
  wget

# NPM dependencies
COPY package.json package-lock.json npm-shrinkwrap.json $APP_ROOT/
RUN yarn install && \
  rm -rf node_modules/@types/mocha # TODO: fix this type conflict

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
RUN yarn build:app

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
COPY src/files $APP_ROOT/src/files

# Build backend
RUN yarn build

HEALTHCHECK --interval=10s --timeout=2s --start-period=20s \
  CMD wget -q -O- http://localhost:6500/status || exit 1

EXPOSE 6500

WORKDIR /app

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "node $APP_ROOT/dist/api/index.js"]
