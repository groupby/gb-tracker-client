#!/usr/bin/env bash
set -e

PACKAGE_VERSION=$(cat ../../package.json | jq .version -r)
#COMMIT_VERSION=$(git rev-parse HEAD | cut -c1-7)
NAME=recommendations-ref-ui

echo "Building and pushing ${NAME}:${PACKAGE_VERSION}"

docker build -t groupbyinc/${NAME}:${PACKAGE_VERSION} -t groupbyinc/${NAME}:latest .
docker push groupbyinc/${NAME}:${PACKAGE_VERSION}
docker push groupbyinc/${NAME}:latest