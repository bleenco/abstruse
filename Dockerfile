# stage 1 ui
FROM node:14-alpine as ui

COPY ./web/abstruse ./app/ui

WORKDIR /app/ui

RUN npm install && npm run build

# stage 2 build
FROM golang:1.16-alpine as build

ARG GIT_COMMIT=""
ENV GIT_COMMIT=$GIT_COMMIT

WORKDIR /app

RUN apk --no-cache add git make protobuf protobuf-dev ca-certificates alpine-sdk

COPY --from=ui /app/ui/dist /app/web/abstruse/dist

COPY . /app/

RUN go get github.com/jkuri/statik github.com/golang/protobuf/protoc-gen-go github.com/google/wire/...

RUN make protoc && make statik && make wire && make server

# stage 3 image
FROM alpine:latest

LABEL maintainer="Jan Kuri <jkuri88@gmail.com>" \
  org.label-schema.schema-version="1.0" \
  org.label-schema.name="abstruse-server" \
  org.label-schema.description="Distributed Continuous Intergration Platform" \
  org.label-schema.url="https://ci.abstruse.cc/" \
  org.label-schema.vcs-url="https://github.com/bleenco/abstruse" \
  org.label-schema.vendor="abstruse"

COPY --from=build /etc/ssl/certs /etc/ssl/certs
COPY --from=build /app/build/abstruse-server /usr/bin/abstruse-server

ENTRYPOINT [ "/usr/bin/abstruse-server" ]

EXPOSE 80
