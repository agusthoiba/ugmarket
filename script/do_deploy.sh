#! /bin/bash
# exit script when any command ran here returns with non-zero exit code
set -e

IMAGE_NAME="ugmarket"
IMAGE_NAMESPACE="gust0"

echo 'MYSQL_HOST: ' $MYSQL_HOST

echo "Starting Ugmarket Web"

docker pull $IMAGE_NAMESPACE/$IMAGE_NAME:$IMAGE_TAG
docker stop $IMAGE_NAME || true
docker rm $IMAGE_NAME || true

# Run database migrations against the production database before starting the web server.
# Uses the same image and runtime .env, so DB_HOST/DB_USER/DB_PASSWORD/DB_NAME are available.
docker run --rm --env-file=.env $IMAGE_NAMESPACE/$IMAGE_NAME:$IMAGE_TAG npm run db:migrate up

docker run -d --restart=always --env-file=.env --name $IMAGE_NAME -p 2000:4000 --add-host=host.docker.internal:$MYSQL_HOST $IMAGE_NAMESPACE/$IMAGE_NAME:$IMAGE_TAG

echo 'success'
