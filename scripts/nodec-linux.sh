#!/bin/bash

if [ $(dpkg-query -W -f='${Status}' squashfs-tools 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
  sudo apt-get install squashfs-tools -y
fi

if [ $(dpkg-query -W -f='${Status}' gcc 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
  sudo apt-get install gcc -y
fi

if [ $(dpkg-query -W -f='${Status}' g++ 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
  sudo apt-get install g++ -y
fi

if [ $(dpkg-query -W -f='${Status}' clang 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
  sudo apt-get install clang -y
fi

if [ $(dpkg-query -W -f='${Status}' clang++ 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
  sudo apt-get install clang++ -y
fi

if [ ! -f nodec ]; then
  curl -L http://enclose.io/nodec/nodec-linux-x64.gz | gunzip > nodec
  chmod +x nodec
fi

npm run build:prod
rm -rf ../node_modules
./nodec --root=../ --output=./abstruse-linux ../dist/api/index.js
