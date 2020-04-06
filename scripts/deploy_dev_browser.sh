#!/bin/bash

# For dev, we only deploy the specific version of the artifact, ex. "1.2.3".
# That way, consumers can only use it by manually specifying the version.
# This includes QA testing.

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

cd cdn
git add "static/javascript/${NAME}-*.js"
git commit -m "Release ${NAME} v${CURRENT_VERSION} (dev)"
git push
