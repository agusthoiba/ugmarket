#! /bin/bash
# exit script when any command ran here returns with non-zero exit code
set -e

IMAGE_NAME="ugmarket"
IMAGE_NAMESPACE="gust0"

echo 'MYSQL_HOST: ' $MYSQL_HOST

echo "Starting Ugmarket Web"

docker pull $IMAGE_NAMESPACE/$IMAGE_NAME
docker stop $IMAGE_NAME
docker rm $IMAGE_NAME

docker run -d --restart=always --env-file=.env --name $IMAGE_NAME -p 2000:4000 --add-host=host.docker.internal:$MYSQL_HOST $IMAGE_NAMESPACE/$IMAGE_NAME

echo 'success'
