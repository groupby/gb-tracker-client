#!/usr/bin/env bash
rm -rf cdn
rm -rf api-javascript

set -e
git clone https://github.com/groupby/cdn.git cdn/
git clone -b gh-pages https://github.com/groupby/api-javascript.git api-javascript/

name=gb-tracker-client
currentVersion=`cat package.json | jq -r .version`

## Create current version
cp dist/${name}-${currentVersion}.js cdn/static/javascript/${name}-${currentVersion}.js
cp dist/${name}-${currentVersion}.min.js cdn/static/javascript/${name}-${currentVersion}.min.js

cp dist/${name}-${currentVersion}.js api-javascript/dist/${name}-${currentVersion}.js
cp dist/${name}-${currentVersion}.min.js api-javascript/dist/${name}-${currentVersion}.min.js

## Create canary
cp dist/${name}-${currentVersion}.js cdn/static/javascript/${name}-canary.js
cp dist/${name}-${currentVersion}.min.js cdn/static/javascript/${name}-canary.min.js

cp dist/${name}-${currentVersion}.js api-javascript/dist/${name}-canary.js
cp dist/${name}-${currentVersion}.min.js api-javascript/dist/${name}-canary.min.js

cd cdn/
git add static/javascript/${name}-*.js
git commit -m "Release ${name} v${currentVersion}"
git push

cd ..
cd api-javascript/
git add dist/${name}-*.js
git commit -m "Release ${name} v${currentVersion}"
git push