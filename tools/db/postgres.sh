#!/usr/bin/env bash

scriptname=$(basename $0)
tmppasswd="passwd090"
sqliteFile=$1

function usage {
  echo "usage: $scriptname input.sqlite"
  exit 1
}

function checkDocker {
  docker ps &> /dev/null
  if [ $? != 0 ]; then
    echo 'Error: docker is not running.' >&2
    exit 1
  fi
}

function runPostgres {
  mkdir -p tmp-data/data
  echo '==> Running PostgreSQL server...'
  docker run -dit --name postgres-import -v $(pwd)/tmp-data:/tmp/tmp-data -v $(pwd)/tmp-data/data:/var/lib/postgresql/data -p 5555:5432 -e POSTGRES_PASSWORD=$tmppasswd postgres:latest &> /dev/null
  if [ $? != 0 ]; then
    echo 'Error: cannot initialize PostgreSQL server.' >&2
    rm -rf tmp-data
    exit 1
  else
    echo '==> Waiting for PostgreSQL server to initialize...'
    sleep 20
  fi
}

function stopPostgres {
  echo '==> Stopping PostgreSQL server...'
  {
    docker stop postgres-import
    docker rm postgres-import
  } &> /dev/null
  if [ $? != 0 ]; then
    echo 'Error: cannot cleanup PostgreSQL server.' >&2
    exit 1
  fi
}

function cleanup {
  echo '==> Cleaning up...'
  rm -rf tmp-data
}

function createDatabase {
  echo "==> Creating database..."
  docker exec -it -e PGPASSWORD=$tmppasswd postgres-import sh -c "createdb -h localhost -U postgres abstruse" >&2
  if [ $? != 0 ]; then
    echo "Error: error creating database." >&2
    stopPostgres
    cleanup
    exit 1
  fi
}

function handleTable {
  file="$1-dump.csv"
  tmpfile="$1-dump-formatted.csv"

  echo "==> Dumping table '$1'" >&2
  sqlite3 -csv -separator ',' $sqliteFile "select * from $1" > "tmp-data/$file"
  if [ $? != 0 ]; then
    echo "Error: error dumping table '$1'" >&2
    stopPostgres
    cleanup
    exit 1
  fi

  echo "==> Converting Unix time epochs to PostgreSQL timestamp format..." >&2
  perl -MPOSIX -pe 's/([0-9]{13})/substr($1, 0, 10)/seg' "tmp-data/$file" > "tmp-data/$tmpfile"
  if [ $? != 0 ]; then
    echo "Error: error converting timestamps for table '$1'" >&2
    stopPostgres
    cleanup
    exit 1
  fi

  perl -MPOSIX -pe 's/(\,)([0-9]{10})/sprintf(",%s" ,strftime("%Y-%m-%d %H:%M:%S", localtime($2)))/seg' "tmp-data/$tmpfile" > "tmp-data/$file"
  if [ $? != 0 ]; then
    echo "Error: error converting timestamps for table '$1'" >&2
    stopPostgres
    cleanup
    exit 1
  fi

  echo "==> Creating table '$1'..."
  docker exec -it -e PGPASSWORD=$tmppasswd postgres-import sh -c "psql -h localhost -U postgres -d abstruse -c \"$2\"" &> /dev/null
  if [ $? != 0 ]; then
    echo "Error: error creating table '$1'" >&2
    stopPostgres
    cleanup
    exit 1
  fi

  echo "==> Importing table '$1'..."
  docker exec -it -e PGPASSWORD=$tmppasswd postgres-import sh -c "psql -h localhost -U postgres -d abstruse -c \"copy $1 from '/tmp/tmp-data/$file' with (format csv);\"" &> /dev/null
  if [ $? != 0 ]; then
    echo "Error: error importing table '$1'" >&2
    stopPostgres
    cleanup
    exit 1
  fi
}

read -r -d '' fixSequencesScript <<-"EOT"
CREATE OR REPLACE FUNCTION fix_sequence(tableName text, columnName text)
RETURNS void AS $$
DECLARE
BEGIN
    EXECUTE 'SELECT setval(pg_get_serial_sequence(''' || tableName || ''', ''' || columnName || '''), (SELECT COALESCE (MAX(' || columnName || ') + 1, 1) FROM ' || tableName || '), false)';
END;
$$ LANGUAGE plpgsql VOLATILE;

SELECT
    table_name || '_' || column_name || '_seq' AS Sequence,
    fix_sequence(table_name, column_name) AS ResetResult
FROM information_schema.columns
WHERE column_default LIKE 'nextval%';

DROP FUNCTION fix_sequence(text, text);
EOT

function fixSequences {
  echo "==> Updating sequences in database..."
  docker exec -it -e PGPASSWORD=$tmppasswd postgres-import sh -c "psql -h localhost -U postgres -d abstruse -c \"$fixSequenceScript\""
  if [ $? != 0 ]; then
    echo "Error: error updating sequences in database" >&2
    stopPostgres
    cleanup
    exit 1
  fi
}

function createDump {
  echo "==> Exporting database into ./abstruse.gz..."
  docker exec -it -e PGPASSWORD=$tmppasswd postgres-import sh -c "pg_dump -h localhost -U postgres -d abstruse | gzip > /tmp/tmp-data/abstruse.gz" &> /dev/null
  if [ $? != 0 ]; then
    echo "Error: error dumping database" >&2
    stopPostgres
    cleanup
    exit 1
  fi

  echo "==> Copying abstruse.gz dump into current working directory..."
  cp -rf $(pwd)/tmp-data/abstruse.gz ./abstruse.gz &> /dev/null
  if [ $? != 0 ]; then
    echo "Error: error copying dump file" >&2
    stopPostgres
    cleanup
    exit 1
  fi
}

if [ "$#" != 1 ]; then
  usage
fi

if ! [ -x "$(command -v sqlite3)" ]; then
  echo 'Error: sqlite3 is not installed.' >&2
  exit 1
fi

if ! [ -x "$(command -v perl)" ]; then
  echo 'Error: perl is not installed.' >&2
  exit 1
fi

if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed.' >&2
  exit 1
fi

checkDocker
runPostgres

createDatabase

handleTable "users" "CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR (255) UNIQUE NOT NULL, fullname VARCHAR (255) NOT NULL, password VARCHAR (255) NOT NULL, admin BOOLEAN NOT NULL DEFAULT '0', avatar VARCHAR (255) NOT NULL DEFAULT '/avatars/user.svg', created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP);"
handleTable "access_tokens" "CREATE TABLE access_tokens (id SERIAL PRIMARY KEY, description VARCHAR (255) NOT NULL, token VARCHAR (255) NOT NULL, users_id INT NOT NULL, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP);"
handleTable "repositories" "CREATE TABLE repositories (id SERIAL PRIMARY KEY, github_id INT, bitbucket_id VARCHAR (255), gitlab_id INT, gogs_id INT, clone_url VARCHAR (255), html_url VARCHAR (255), default_branch VARCHAR (255), name VARCHAR (255), full_name VARCHAR (255), description VARCHAR (255), private BOOLEAN NOT NULL DEFAULT '0', fork BOOLEAN, user_login VARCHAR (255), user_id VARCHAR (255), user_avatar_url VARCHAR (255), user_url VARCHAR (255), user_html_url VARCHAR (255), access_tokens_id INT, public BOOLEAN NOT NULL DEFAULT '1', data JSON, created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP, repository_provider VARCHAR (255), api_url VARCHAR (255));"
handleTable "builds" "CREATE TABLE builds (id SERIAL PRIMARY KEY, branch VARCHAR (255), pr INT, head_id INT, data JSON, parsed_config JSON, start_time TIMESTAMP, end_time TIMESTAMP, repositories_id INT NOT NULL, created_at TIMESTAMP, updated_at TIMESTAMP);"
handleTable "build_runs" "CREATE TABLE build_runs (id SERIAL PRIMARY KEY, head_id INT, start_time TIMESTAMP, end_time TIMESTAMP, build_id INT NOT NULL, created_at TIMESTAMP, updated_at TIMESTAMP);"
handleTable "jobs" "CREATE TABLE jobs (id SERIAL PRIMARY KEY, data JSON, builds_id INT NOT NULL, created_at TIMESTAMP, updated_at TIMESTAMP);"
handleTable "job_runs" "CREATE TABLE job_runs (id SERIAL PRIMARY KEY, start_time TIMESTAMP NOT NULL, end_time TIMESTAMP, status VARCHAR(10) NOT NULL DEFAULT 'queue', log TEXT, job_id INT NOT NULL, build_run_id INT NOT NULL, created_at TIMESTAMP, updated_at TIMESTAMP);"
handleTable "permissions" "CREATE TABLE permissions (id SERIAL PRIMARY KEY, repositories_id INT NOT NULL, users_id INT NOT NULL, permission BOOLEAN NOT NULL DEFAULT '1', created_at TIMESTAMP, updated_at TIMESTAMP);"
handleTable "environment_variables" "CREATE TABLE environment_variables (id SERIAL PRIMARY KEY, repositories_id INT NOT NULL, name VARCHAR (255) NOT NULL, value VARCHAR (255) NOT NULL, created_at TIMESTAMP, updated_at TIMESTAMP);"
handleTable "logs" "CREATE TABLE logs (id SERIAL PRIMARY KEY, type VARCHAR(20) NOT NULL, message TEXT NOT NULL, read BOOLEAN NOT NULL DEFAULT '0', created_at TIMESTAMP, updated_at TIMESTAMP, notify BOOLEAN NOT NULL DEFAULT '0');"

fixSequences
createDump

stopPostgres
cleanup

echo '==> Done.'
exit 0
