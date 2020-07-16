#!/bin/bash

NAME="gb-tracker-client"
CURRENT_VERSION="$(cat package.json | jq -r .version)"
CURRENT_VERSION_MAJOR="$(cat package.json | jq -r .version | cut -d '.' -f 1)"
DEPLOY_DIR="staged_for_deploy"

# First, build and stage.
scripts/stage_for_browser_deploy.sh \
  ${NAME} \
  ${CURRENT_VERSION} \
  ${CURRENT_VERSION_MAJOR} \
  ${DEPLOY_DIR}

# Then, copy the built files to the GCS bucket.
GCS_BUCKET="beacons_dev"

gsutil cp -z js "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION}.js" "gs://${GCS_BUCKET}"
gsutil cp -z js  "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION}.min.js" "gs://${GCS_BUCKET}"

gsutil cp -z js "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION_MAJOR}.js" "gs://${GCS_BUCKET}"
gsutil cp -z js "${DEPLOY_DIR}/${NAME}-${CURRENT_VERSION_MAJOR}.min.js" "gs://${GCS_BUCKET}"

