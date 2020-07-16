#!/bin/bash

NAME="gb-tracker-client"
NAME_ON_CDN="gb-tracker-client-cicd-test"
CURRENT_VERSION="$(cat package.json | jq -r .version)"
CURRENT_VERSION_MAJOR="$(cat package.json | jq -r .version | cut -d '.' -f 1)"
DEPLOY_DIR="staged_for_deploy"

GCS_BUCKET=$1

npm run clean
npm run buildForBrowser

mkdir ${DEPLOY_DIR}

# Make major version and specific version files, for both full and minified.
cp "build/${NAME}-${CURRENT_VERSION}.js" "${DEPLOY_DIR}/${NAME_ON_CDN}-${CURRENT_VERSION}.js"
cp "build/${NAME}-${CURRENT_VERSION}.min.js" "${DEPLOY_DIR}/${NAME_ON_CDN}-${CURRENT_VERSION}.min.js"

cp "build/${NAME}-${CURRENT_VERSION}.js" "${DEPLOY_DIR}/${NAME_ON_CDN}-${CURRENT_VERSION_MAJOR}.js"
cp "build/${NAME}-${CURRENT_VERSION}.min.js" "${DEPLOY_DIR}/${NAME_ON_CDN}-${CURRENT_VERSION_MAJOR}.min.js"

# Then, copy to bucket.
gsutil cp -z js "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION}.js" "gs://${GCS_BUCKET}"
gsutil cp -z js  "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION}.min.js" "gs://${GCS_BUCKET}"

gsutil cp -z js "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION_MAJOR}.js" "gs://${GCS_BUCKET}"
gsutil cp -z js "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION_MAJOR}.min.js" "gs://${GCS_BUCKET}"
