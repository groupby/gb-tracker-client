#!/bin/bash

# For prod, we deploy the specific version of the artifact, ex. "1.2.3", and we
# replace the major version of the artifact with the specific version, ex.
# replace "1" with the contents of "1.2.3". This enables the artifact to be
# automatically picked up by CDN users. It is effectively "pushed to prod".

# Build first
npm run clean
npm run buildForNpm

# Then deploy
npm publish
