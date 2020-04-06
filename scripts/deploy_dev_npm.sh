#!/bin/bash

# This script is left empty but kept to make it clear that this is an explicit
# no op. We don't push a "dev" NPM build because it would be impossible for
# us to use the technique we use for the "dev" CDN build, where we push only
# the exact version file, and prevent customers from accidentally upgrading to
# (via dependabot etc). Instead, you can test the build via NPM by creating an
# NPM app (ie "npm init") and installing it via relative directory (ie "npm
# install ../gb-tracker-client").

echo "no op"
