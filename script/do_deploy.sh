  GNU nano 4.8                                                                                do_deploy.sh
#! /bin/bash
# exit script when any command ran here returns with non-zero exit code
set -e

IMAGE_NAME="ugmarket"
IMAGE_NAMESPACE="gust0"


echo 'MYSQL_HOST: ' $MYSQL_HOST

echo "Starting Ugmarket Web"

sudo docker pull $IMAGE_NAMESPACE/$IMAGE_NAME

TAG_ID=$(sudo docker ps -q -f name="$IMAGE_NAME")
echo 'TAG_ID: ' $TAG_ID

if [ $TAG_ID !=  '' ]
then
   sudo docker rm $(sudo docker stop $(sudo docker ps -q -f name="$IMAGE_NAME"))
fi

sudo docker run -d --restart=always --env-file=.env --name $IMAGE_NAME -p 2000:4000 --add-host mysqlhost:$MYSQL_HOST $IMAGE_NAMESPACE/$IMAGE_NAME

echo 'success'
