#!/usr/bin/env bash
rm -rf cdn

set -e
git clone https://github.com/groupby/cdn.git cdn/

name=gb-tracker-client
currentVersion=`cat package.json | jq -r .version`

## Create current version
# NOT YET STABLE
#cp dist/${name}-${currentVersion}.js ${HOME}/cdn/static/${name}-${currentVersion}.js
#cp dist/${name}-${currentVersion}.min.js ${HOME}/cdn/static/${name}-${currentVersion}.min.js

## Create canary
cp dist/${name}-${currentVersion}.js cdn/static/javascript/${name}-canary.js
cp dist/${name}-${currentVersion}.min.js cdn/static/javascript/${name}-canary.min.js

cd cdn/
git add static/javascript/${name}-*.js
git commit -m "Release ${name} v${currentVersion}"
git push