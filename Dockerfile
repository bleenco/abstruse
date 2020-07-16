# stage 1 ui
FROM node:14-alpine as ui

COPY ./web/abstruse ./app/ui

WORKDIR /app/ui

RUN apk --no-cache add yarn && yarn install && yarn build

# stage 2 build
FROM golang:1.14-alpine as build

WORKDIR /app

RUN apk --no-cache add git make protobuf protobuf-dev ca-certificates alpine-sdk

COPY --from=ui /app/ui/dist /app/web/abstruse/dist

COPY . /app/

RUN go get github.com/jkuri/statik github.com/golang/protobuf/protoc-gen-go@v1.3

RUN make protoc && make statik && make server

# stage 3 image
FROM scratch

COPY --from=build /etc/ssl/certs /etc/ssl/certs
COPY --from=build /app/build/abstruse-server /usr/bin/abstruse-server

ENTRYPOINT [ "/usr/bin/abstruse-server" ]

EXPOSE 80 2379 2380
