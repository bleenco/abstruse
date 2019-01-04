# stage 1 ui
FROM node:11-alpine as ui

COPY ./web/abstruse ./app/ui

WORKDIR /app/ui

RUN npm install && npm run build

# stage 2 build
FROM golang:1.11-alpine as build

WORKDIR /app

RUN apk --no-cache add git make protobuf protobuf-dev ca-certificates

COPY --from=ui /app/ui/dist /app/web/abstruse/dist

COPY . /app/

RUN go get -u github.com/rakyll/statik github.com/golang/protobuf/protoc-gen-go

RUN make grpc && make

# stage 3 image
FROM scratch

COPY --from=build /etc/ssl/certs /etc/ssl/certs
COPY --from=build /app/build/abstruse /usr/bin/abstruse

ENTRYPOINT [ "/usr/bin/abstruse" ]

EXPOSE 80 443 3330
