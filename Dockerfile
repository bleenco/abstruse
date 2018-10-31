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

RUN apk --no-cache add openssl \
  && wget https://download.docker.com/linux/static/stable/$ARCH/docker-$DOCKER_VERSION.tgz -O /tmp/docker.tgz \
  && mkdir /tmp/docker && tar xzf /tmp/docker.tgz -C /tmp \
  && mv /tmp/docker/docker /usr/bin/docker \
  && chmod 755 /usr/bin/docker

# Development dependencies
RUN apk add --no-cache \
  curl \
  g++ \
  gcc \
  git \
  make \
  sqlite \
  python

# Production dependencies
RUN apk --no-cache add \
  git \
  sqlite \
  tini \
  wget

COPY package.json package-lock.json tsconfig.json webpack.*.js angular.json /app/
COPY src /app/src

RUN npm install --only=production \
  && cp -R node_modules prod_node_modules

RUN npm install \
  && npm run build:prod

HEALTHCHECK --interval=10s --timeout=2s --start-period=20s \
  CMD wget -q -O- http://localhost:6500/status || exit 1

EXPOSE 6500

ENTRYPOINT ["/sbin/tini", "--"]
CMD [ "node", "dist/api/index.js" ]
