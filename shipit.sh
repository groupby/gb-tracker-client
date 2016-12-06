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
cp dist/${name}-${currentVersion}.js cdn/static/javascript/${name}-${currentVersion}.js
cp dist/${name}-${currentVersion}.min.js cdn/static/javascript/${name}-${currentVersion}.min.js

cp dist/${name}-${currentVersion}.js api-javascript/dist/${name}-${currentVersion}.js
cp dist/${name}-${currentVersion}.min.js api-javascript/dist/${name}-${currentVersion}.min.js

## Update latest major version
cp dist/${name}-${currentVersion}.js cdn/static/javascript/${name}-${currentMajor}.js
cp dist/${name}-${currentVersion}.min.js cdn/static/javascript/${name}-${currentMajor}.min.js

cp dist/${name}-${currentVersion}.js api-javascript/dist/${name}-${currentMajor}.js
cp dist/${name}-${currentVersion}.min.js api-javascript/dist/${name}-${currentMajor}.min.js

## Update canary
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

cd ..
cd documentation/
sed -i "s/gb-tracker-client-.\{1,3\}\.min\.js/gb-tracker-client-${currentMajor}.min.js/g" src/main/webapp/WEB-INF/jsp/wisdom/productv2.x.x/100_EventTracking/00_Installation.md
sed -i "s/gb-tracker-client-.\{1,3\}\.min\.js/gb-tracker-client-${currentMajor}.min.js/g" src/main/webapp/WEB-INF/jsp/wisdom/productv2.x.x/100_EventTracking/03_TrackerDetails.md

sed -i "s/Should be .\{5,10\}/Should be ${currentVersion}/g" src/main/webapp/WEB-INF/jsp/wisdom/productv2.x.x/200_adminInternal/02_VerifyingBeaconData.md

git add src/main/webapp/WEB-INF/jsp/wisdom/productv2.x.x/100_EventTracking/00_Installation.md
git add src/main/webapp/WEB-INF/jsp/wisdom/productv2.x.x/100_EventTracking/03_TrackerDetails.md
git add src/main/webapp/WEB-INF/jsp/wisdom/productv2.x.x/200_adminInternal/02_VerifyingBeaconData.md
git commit -m "Release ${name} v${currentVersion}"
git push
