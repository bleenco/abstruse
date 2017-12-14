#!/bin/sh

VNC_STORE_PWD_FILE=/home/abstruse/.vnc/passwd
if [ ! -e "${VNC_STORE_PWD_FILE}" -o -n "${VNC_PASSWORD}" ]; then
  mkdir -vp /home/abstruse/.vnc > /dev/null 2>&1
  x11vnc -storepasswd ${VNC_PASSWORD:-abstrusePass} ${VNC_STORE_PWD_FILE} > /dev/null 2>&1
fi

export DISPLAY=:99

{
  sudo /etc/init.d/xvfb start && sleep 3
  sudo /etc/init.d/fluxbox start
  /etc/init.d/x11vnc start
  sudo /etc/init.d/ssh start
} > /dev/null 2>&1

/bin/bash

