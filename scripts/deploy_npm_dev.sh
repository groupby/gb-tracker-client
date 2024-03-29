#!/bin/bash

# Prepare new version of package.json for dev deploy
CURRENT_VERSION="$(cat package.json | jq -r .version)"
BETA_VERSION="${CURRENT_VERSION}-beta.$(date +%s)"
cat package.json | sed "s/${CURRENT_VERSION}/${BETA_VERSION}/g" > package.json.new
# Doesn't work without separate cp step.
cp package.json.new package.json
rm package.json.new

npm run buildForNpm
npm publish --tag beta
