#!/bin/bash

# For prod, we deploy the specific version of the artifact, ex. "1.2.3", and we
# replace the major version of the artifact with the specific version, ex.
# replace "1" with the contents of "1.2.3". This enables the artifact to be
# automatically picked up by CDN users. It is effectively "pushed to prod".

# Build first
npm run clean
npm run buildForBrowser

# Then deploy
NAME="gb-tracker-client"

CURRENT_VERSION="$(cat package.json | jq -r .version)"
CURRENT_VERSION_MAJOR="$(cat package.json | jq -r .version | cut -d '.' -f 1)"

DEPLOY_DIR="staged_for_deploy"

GCS_BUCKET="beacons_dev"

## Create current version

mkdir staged_for_deploy

## Make major version and specific version files, for both full and minified.
cp "build/${NAME}-${CURRENT_VERSION}.js" "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION}.js"
cp "build/${NAME}-${CURRENT_VERSION}.min.js" "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION}.min.js"

cp "build/${NAME}-${CURRENT_VERSION}.js" "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION_MAJOR}.js"
cp "build/${NAME}-${CURRENT_VERSION}.min.js" "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION_MAJOR}.min.js"

## Copy all 4 builds GCS bucket
gsutil cp -z js "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION}.js" "gs://${GCS_BUCKET}"
gsutil cp -z js  "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION}.min.js" "gs://${GCS_BUCKET}"

gsutil cp -z js "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION_MAJOR}.js" "gs://${GCS_BUCKET}"
gsutil cp -z js "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION_MAJOR}.min.js" "gs://${GCS_BUCKET}"
