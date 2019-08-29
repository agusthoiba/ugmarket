#! /bin/bash
# exit script when any command ran here returns with non-zero exit code
set -e

sudo docker login -u $DOCKER_USERNAME -p $DOCKER_PWD
sudo docker run -d --restart=always --name ugmarket-web -p 80:4000 gust0/ugmarket

echo 'success'
