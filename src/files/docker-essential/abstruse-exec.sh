#!/usr/bin/env bash

COLOR_NC="\e[0m"
COLOR_GREEN="\e[0;32m"
COLOR_RED="\e[0;31m"
COLOR_WHITE="\e[1;37m"

setsid /usr/bin/abstruse-pty "$*" & pgid=$!

wait $pgid
code=$?

if [ $code -gt 0 ]; then
  echo
  echo -e "$COLOR_RED[error]: command exited with error code ${code}\e[0m"
else
  echo
  echo -e "$COLOR_GREEN[success]: command exited with error code ${code}\e[0m"
fi

exit $code

