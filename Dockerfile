FROM mhart/alpine-node:10 as build
WORKDIR /app

ARG VCS_REF=n/a
ARG VERSION=dev
ARG BUILD_DATE=n/a

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
COPY package.json package-lock.json npm-shrinkwrap.json /app/

RUN npm install --only=production && \
  cp -R node_modules prod_node_modules && \
  npm install && \
  rm -rf node_modules/@types/mocha # TODO: fix this type conflict

# Copy shared files
COPY tsconfig.json /app

# Copy frontend
COPY angular.json /app
COPY src/environments /app/src/environments
COPY src/app /app/src/app
COPY src/assets /app/src/assets
COPY src/styles /app/src/styles
COPY src/testing /app/src/testing

COPY src/index.html \
  src/main.ts \
  src/polyfills.ts \
  src/test.ts \
  src/tsconfig.app.json \
  src/tsconfig.spec.json \
  src/typings.d.ts \
  /app/src/

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
COPY webpack.api.js /app
COPY src/api /app/src/api
COPY src/files /app/src/files
COPY src/tsconfig.api.json /app/src
COPY src/files /app/src/files

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
