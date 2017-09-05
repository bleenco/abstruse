#!/usr/bin/env bash

set -e

SCRIPT="${0##*/}"

declare -i DEFAULT_TIMEOUT=3600
declare -i DEFAULT_INTERVAL=1
declare -i DEFAULT_DELAY=1

declare -i timeout=DEFAULT_TIMEOUT
declare -i interval=DEFAULT_INTERVAL
declare -i delay=DEFAULT_DELAY

COLOR_NC="\e[0m"
COLOR_GREEN="\e[0;32m"
COLOR_RED="\e[0;31m"
COLOR_WHITE="\e[1;37m"

print_usage() {
  cat <<EOF

Abstruse CI command execution script

Synopsis
  $SCRIPT [-t timeout] command
  Execute a command with a time-out.
  Upon time-out expiration SIGKILL (0) is sent to the process.

  -t timeout
    Number of seconds to wait for command completion.
    Default value: $DEFAULT_TIMEOUT seconds.
    Value must be integer.

EOF
}

while getopts ":t:" option; do
  case "$option" in
    t) timeout=$OPTARG ;;
    *) print_usage && exit 1 ;;
  esac
done
shift $((OPTIND - 1))

error_handler() {
  code=$?
  if [ $code -gt 0 ]; then
    echo
    echo -e "$COLOR_RED[error]: command exited with error code ${code}\e[0m"
  else
    echo
    echo -e "$COLOR_GREEN[success]: command exited with error code ${code}\e[0m"
  fi

  exit $code
}

trap "error_handler" INT TERM EXIT QUIT HUP

if (($# == 0)); then
  print_usage
  exit 1
fi

( $@ ) & pid=$!
( sleep $timeout && kill -s KILL $pid ) 2>/dev/null & watcher=$!

if wait $pid 2>/dev/null; then
  kill -9 $watcher
  exit 0
else
  exit 1
fi
