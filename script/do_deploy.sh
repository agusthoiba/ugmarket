#! /bin/bash
# exit script when any command ran here returns with non-zero exit code
set -e

IMAGE_NAME="ugmarket"
IMAGE_NAMESPACE="gust0"

echo "Starting Ugmarket Web"

docker pull $IMAGE_NAMESPACE/$IMAGE_NAME
docker rm $(docker stop $(docker ps -q -f name="$IMAGE_NAME"))
docker run -d --restart=always --env-file=.env --name $IMAGE_NAME -p 80:4000 --add-host mysqlhost:$MYSQL_HOST $IMAGE_NAMESPACE/$IMAGE_NAME

echo 'success'
