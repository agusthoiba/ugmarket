#! /bin/bash
# exit script when any command ran here returns with non-zero exit code
set -e

CONTAINER_NAME="ugmarket-web"

echo "Starting Ugmarket Web"

#Check for running container & stop it before starting a new one
docker rm $(docker stop $(docker ps -q -f name="$CONTAINER_NAME"))
docker run -d --restart=always --env_file=.env --name $CONTAINER_NAME -p 80:4000 gust0/ugmarket

echo 'success'