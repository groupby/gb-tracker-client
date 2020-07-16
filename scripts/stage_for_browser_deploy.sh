#!/bin/bash

npm run clean
npm run buildForBrowser

NAME=$1
CURRENT_VERSION=$2
CURRENT_VERSION_MAJOR=$3
DEPLOY_DIR=$4

mkdir ${DEPLOY_DIR}

## Make major version and specific version files, for both full and minified.
cp "build/${NAME}-${CURRENT_VERSION}.js" "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION}.js"
cp "build/${NAME}-${CURRENT_VERSION}.min.js" "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION}.min.js"

cp "build/${NAME}-${CURRENT_VERSION}.js" "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION_MAJOR}.js"
cp "build/${NAME}-${CURRENT_VERSION}.min.js" "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION_MAJOR}.min.js"
