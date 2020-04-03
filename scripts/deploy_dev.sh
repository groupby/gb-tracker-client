#!/usr/bin/env bash
set -e
rm -rf cdn

set -e
git clone https://github.com/groupby/cdn.git cdn/

name=gb-tracker-client
currentVersion=$(cat package.json | jq -r .version)
currentMajor=$(cat package.json | jq -r .version | cut -d '.' -f 1)

## Create current version
cp build/${name}-${currentVersion}.js cdn/static/javascript/${name}-${currentVersion}.js
cp build/${name}-${currentVersion}.min.js cdn/static/javascript/${name}-${currentVersion}.min.js

## Update latest major version
cp build/${name}-${currentVersion}.js cdn/static/javascript/${name}-${currentMajor}.js
cp build/${name}-${currentVersion}.min.js cdn/static/javascript/${name}-${currentMajor}.min.js

cd cdn/
git add static/javascript/${name}-*.js
git commit -m "Release ${name} v${currentVersion}"
git push
