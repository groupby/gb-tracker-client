#!/usr/bin/env bash
set -e
rm -rf cdn
rm -rf api-javascript
rm -rf documentation

set -e
git clone https://github.com/groupby/cdn.git cdn/
git clone -b gh-pages https://github.com/groupby/api-javascript.git api-javascript/
git clone https://github.com/groupby/documentation.git documentation/

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

git add src/main/webapp/WEB-INF/jsp/wisdom/productv2.x.x/100_EventTracking/00_Installation.md
git add src/main/webapp/WEB-INF/jsp/wisdom/productv2.x.x/100_EventTracking/03_TrackerDetails.md
git add src/main/webapp/WEB-INF/jsp/wisdom/productv2.x.x/200_adminInternal/02_VerifyingBeaconData.md
git commit -m "Release ${name} v${currentVersion}"
git push
