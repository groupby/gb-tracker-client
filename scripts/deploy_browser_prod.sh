#!/bin/bash

echo "Production browser deploy not automated yet. Exiting."
exit 0

GCS_BUCKET="groupby-cdn"

scripts/deploy_browser.sh ${GCS_BUCKET}
