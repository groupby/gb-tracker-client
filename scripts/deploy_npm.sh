#!/bin/bash

npm run buildForNpm

# *Remove dry-run when it's ready*
npm publish --dry-run
