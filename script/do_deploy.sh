#! /bin/bash
# exit script when any command ran here returns with non-zero exit code
set -e

CONTAINER_NAME="ugmarket-web"

echo "Starting Ugmarket Web"

if [ $(docker inspect -f '{{.State.Running}}' $CONTAINER_NAME) = "true" ]; then
    docker stop $CONTAINER_NAME
fi

docker run -d --restart=always --name $CONTAINER_NAME -p 80:4000 gust0/ugmarket

echo 'success'
