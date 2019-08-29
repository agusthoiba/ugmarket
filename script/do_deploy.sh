#! /bin/bash
# exit script when any command ran here returns with non-zero exit code
set -e

COMMIT_SHA1=$CIRCLE_SHA1

# We must export it so it's available for envsubst
export COMMIT_SHA1=$COMMIT_SHA1

docker run -d --restart=always --name ugmarket-web -p 80:4000 gust0/ugmarket

echo 'success'
