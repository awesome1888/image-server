#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VERSION="${1:-latest}"

# build backend
cd $DIR/../app/backend/;
docker build -f docker/production.docker -t awesome1888/image-server:$VERSION .
docker push awesome1888/image-server:$VERSION
docker rmi awesome1888/image-server:$VERSION

