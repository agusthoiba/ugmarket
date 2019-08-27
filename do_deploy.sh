#!/usr/bin/env bash

cat >> ~/.ssh/config  << EOF
VerifyHostKeyDNS yes
StrictHostKeyChecking no
EOF
  
echo "stopping running application"
sudo docker stop ugmarket-web
sudo docker rm ugmarket-web

echo "pulling latest version of the code"
sudo docker pull gust0/ugmarket
sudo docker stop ugmarket-web
sudo docker rm ugmarket-web

echo "starting the new version"
sudo docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

echo "success!"