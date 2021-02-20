## Quickstart

### Table of Contents
* [Available Flags](#available-flags)
* [Docker](#docker)
* [Install From Source](#install-from-source)
* [Run Test Builds](#run-test-builds)

### Available Flags
You can choose to use environment variables instead of flags when running abstruse server or worker.
All environment variables are prefixed with uppercased `ABSTRUSE`.
Example for running `abstruse` with environment variables:

```sh
# make sure you use same JWT auth secret on server and all workers instances,
# or server and workers would not be able authenticate correctly
export JWTSECRET=cd90901
# first, run ./abstruse-server
ABSTRUSE_HTTP_ADDR=0.0.0.0:8080 \
ABSTRUSE_AUTH_JWTSECRET=$JWTSECRET \
ABSTRUSE_DB_HOST=localhost \
ABSTRUSE_DB_PORT=3306 \
ABSTRUSE_DB_PASSWORD=mydbpassword \
ABSTRUSE_LOGGER_LEVEL=debug \
./abstruse-server
# in another terminal session, we run one abstruse-worker instance
ABSTRUSE_GRPC_ADDR=0.0.0.0:3330 \ # workers gRPC server listen addr
ABSTRUSE_AUTH_JWTSECRET=$JWTSECRET \ # we use same secret as we did for server
ABSTRUSE_SERVER_ADDR=http://0.0.0.0:8080 \ # here we specify server api url
ABSTRUSE_SCHEDULER_MAXPARALLEL=4 \ # here we specify max parallel jobs that this worker can run
./abstruse-worker
```

Both `abstruse-server` and `abstruse-worker` on initial run generates a config file which you can later change or update if needed.
Available flags for `abstruse-server`:

```
--auth-jwtsecret string    JWT authentication secret key (default is a random string)
--config string            config file (default is $HOME/abstruse/abstruse.json)
--db-charset string        database charset (default "utf8")
--db-driver string         database client (available options: mysql, postgres, mssql) (default "mysql")
--db-host string           database server host address (default "localhost")
--db-name string           database name (file name when sqlite client used) (default "abstruse")
--db-password string       database password
--db-port int              database server port (default 3306)
--db-user string           database username (default "root")
--help                     help for abstruse
--http-addr string         HTTP server listen address (default "0.0.0.0:80")
--http-compress            enable HTTP response gzip compression
--http-tls                 run HTTP server in TLS mode
--http-uploaddir string    HTTP uploads directory (default "uploads/")
--logger-filename string   log filename (default "abstruse.log")
--logger-level string      logging level (available options: debug, info, warn, error, panic, fatal) (default "info")
--logger-max-age int       maximum log age (default 3)
--logger-max-backups int   maximum log file backups (default 3)
--logger-max-size int      maximum log file size (in MB) (default 500)
--logger-stdout            print logs to stdout (default true)
--tls-cert string          path to SSL certificate file (default "cert.pem")
--tls-key string           path to SSL private key file (default "key.pem")
--websocket-addr string    WebSocket server listen address (default "127.0.0.1:2220")
```
Available flags for `abstruse-worker`:
```
--auth-jwtsecret string       JWT authentication secret key (default is a random string)
--config string               config file (default is $HOME/abstruse/abstruse-worker.json)
--grpc-addr string            gRPC server listen address (default "0.0.0.0:3330")
--help                        help for abstruse-worker
--id string                   worker node ID (default "adf7f8e1")
--logger-filename string      log filename (default "abstruse-worker.log")
--logger-level string         logging level (available options: debug, info, warn, error, panic, fatal) (default "info")
--logger-max-age int          maximum log age (default 3)
--logger-max-backups int      maximum log file backups (default 3)
--logger-max-size int         maximum log file size (in MB) (default 500)
--logger-stdout               print logs to stdout (default true)
--registry-addr string        docker image registry server addr (default "https://registry-1.docker.io")
--registry-password string    docker image registry password
--registry-username string    docker image registry username
--scheduler-maxparallel int   scheduler max parallel option defines how many jobs can run in parallel (default 5)
--server-addr string          abstruse server remote address (default "http://localhost")
--tls-cert string             path to SSL certificate file (default "cert-worker.pem")
--tls-key string              path to SSL private key file (default "key-worker.pem")
```

### Docker

1. Clone repository
```sh
git clone https://github.com/bleenco/abstruse && cd abstruse
```
2. Build Docker images
```sh
make docker
```
3. Run the project via `docker-compose` command
```sh
docker-compose -f configs/demo/default/docker-compose.yml up -d
```
4. Open browser at http://localhost and finish the setup.

### Install From Source

1. Clone repository
```sh
git clone https://github.com/bleenco/abstruse && cd abstruse
```
2. Install dependencies
This steps assumes that you have `go` and `node` and `yarn` installed on your host.
```sh
make install_dependencies
```
3. Build the project
```sh
make
```
This will build both `abstruse-server` and `abstruse-worker` into `build/` directory.

### Run Test Builds

Here we use demo GitHub user that already has some repositories configured to run on abstruse (have `.abstruse.yml` config included in repo).

1. In User UI in header click on drop-down menu then navigate to `Providers` section.
2. Add GitHub Provider with access token `5e45d0276bbe290f4bd34774d5d3f28bdaef0292`.
3. If provider has been added successfully you can now see it in providers list:
Click on `Synchronize` to sync the repositories with abstruse.
4. Go to repositories and enable `abstruseci/d3-bundle` repository.
5. Navigate to repository `abstruseci/d3-bundle` and click on `Settings`.
6. Scroll down to Config section and `Fetch Config` from repository.
7. Click on Trigger build button to start the test build
8. Navigate to builds where you should see the build that you have just triggered.
