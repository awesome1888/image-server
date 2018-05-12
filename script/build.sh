#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR/../app/backend/;
docker build -t awesome1888/image-server:latest .;
docker push awesome1888/image-server:latest;
