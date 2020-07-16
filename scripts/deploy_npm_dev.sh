#!/bin/bash

# Prepare new version of package.json for dev deploy
CURRENT_VERSION="$(cat package.json | jq -r .version)"
BETA_VERSION="${CURRENT_VERSION}-beta.0"
cat package.json | sed "s/${CURRENT_VERSION}/${BETA_VERSION}/g" > package.json

scripts/deploy_npm.sh
