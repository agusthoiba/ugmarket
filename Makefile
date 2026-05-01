# This makefile is designed to work for any jenius2 microservice, worker or
# cron. Use 'test' to run node tests, use 'build' to create a docker image, and
# use 'push env=dev/sit/uat/prod' to push to a docker registry.
# This makefile will always use the current folder as the name of the service.
DOCKER_REGISTRY=registry.hub.docker.io
# GIT_SHORT_SHA := $(shell git log -1 --format="%h")

# The image name is the name of the folder
IMAGE_NAMESPACE=gust0
IMAGE_NAME=ugmarket
COMMIT_ID ?= $(shell git rev-parse --short HEAD)

# Run local tests, with coverage.
test:
	npm config set strict-ssl false
	#npm install --registry http://$(NPM_REGISTRY)
	#cp .env.example .env
	#npm run lint
	#npm run test:coverage

# Build the Docker image and add the needed tags.
build:
	docker build \
		--build-arg=SERVICE_NAME=$(IMAGE_NAME) \
		--platform linux/amd64 \
		-t=$(IMAGE_NAMESPACE)/$(IMAGE_NAME) .
	docker tag $(IMAGE_NAMESPACE)/$(IMAGE_NAME) $(IMAGE_NAMESPACE)/$(IMAGE_NAME):$(COMMIT_ID)

# Pushes to the configured registry.
push:
	docker push $(IMAGE_NAMESPACE)/$(IMAGE_NAME):$(COMMIT_ID)

run:
	./script/do_deploy.sh

# Make will get confused if there are files and folders with the names of
# recipes, unless we mark them as 'PHONY'.
.PHONY: test build push
