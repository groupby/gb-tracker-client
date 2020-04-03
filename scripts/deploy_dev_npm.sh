#!/bin/bash

# Build first
npm run clean
npm run buildForNpm

# Then deploy

# Override version, add "-beta.0" suffix.
RAW_VERSION=$(node -p 'require("./package.json").version;')
VERSION="${RAW_VERSION}-beta.0"


