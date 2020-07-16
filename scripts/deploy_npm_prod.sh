#!/bin/bash

# No changes to make for package.json. Just publish.

# **Temporary for prod test. Change when done.**
cat package.json | sed "s/gb-tracker-client/gb-tracker-client-cicd-test/g" > package.json

scripts/deploy_npm.sh
