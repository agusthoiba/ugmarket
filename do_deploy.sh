#!/usr/bin/env bash

cat >> ~/.ssh/config  << EOF
VerifyHostKeyDNS yes
StrictHostKeyChecking no
EOF
  
echo "stopping running application"
echo ssh -i $DO_USER@$DO_IP 'docker stop ugmarket-web'
ssh $DO_USER@$DO_IP 'docker rm ugmarket-web'

echo "pulling latest version of the code"
ssh -i $PATH_TO_PRIVATE_KEY $DO_USER@$DO_IP 'docker pull gust0/ugmarket:master'
ssh -i $PATH_TO_PRIVATE_KEY $DO_USER@$DO_IP 'docker stop ugmarket-web'
ssh -i $PATH_TO_PRIVATE_KEY $DO_USER@$DO_IP 'docker rm ugmarket-web'

echo "starting the new version"
ssh -i $PATH_TO_PRIVATE_KEY $DO_USER@$DO_IP 'docker run -d --restart=always --name ugmarket-web -p 80:4000 gust0/ugmarket:master'

echo "success!"