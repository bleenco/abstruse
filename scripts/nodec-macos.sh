#!/bin/bash

if ! brew ls --versions squashfs > /dev/null; then
  brew install squashfs
fi

if [ ! -f nodec ]; then
  curl -L http://enclose.io/nodec/nodec-darwin-x64.gz | gunzip > nodec
  chmod +x nodec
fi

npm run build:prod
rm -rf ../node_modules
./nodec --root=../ --output=./abstruse-macos ../dist/api/index.js
