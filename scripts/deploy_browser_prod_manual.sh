#!/bin/bash

# For prod, we deploy the specific version of the artifact, ex. "1.2.3", and we
# replace the major version of the artifact with the specific version, ex.
# replace "1" with the contents of "1.2.3". This enables the artifact to be
# automatically picked up by CDN users. It is effectively "pushed to prod".

# Build first
npm run clean
npm run buildForBrowser

# Then deploy
set -e
rm -rf cdn

set -e
git clone https://github.com/groupby/cdn.git cdn

NAME="gb-tracker-client"

CURRENT_VERSION="$(cat package.json | jq -r .version)"
CURRENT_VERSION_MAJOR="$(cat package.json | jq -r .version | cut -d '.' -f 1)"

## Create current version
cp "build/${NAME}-${CURRENT_VERSION}.js" "cdn/static/javascript/${NAME}-${CURRENT_VERSION}.js"
cp "build/${NAME}-${CURRENT_VERSION}.min.js" "cdn/static/javascript/${NAME}-${CURRENT_VERSION}.min.js"

## Update latest major version
cp "build/${NAME}-${CURRENT_VERSION}.js" "cdn/static/javascript/${NAME}-${CURRENT_VERSION_MAJOR}.js"
cp "build/${NAME}-${CURRENT_VERSION}.min.js" "cdn/static/javascript/${NAME}-${CURRENT_VERSION_MAJOR}.min.js"

cd cdn
git add "static/javascript/${NAME}-*.js"
git commit -m "Release ${NAME} v${CURRENT_VERSION}"
git push