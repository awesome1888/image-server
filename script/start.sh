#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

npm install;
cd $DIR/../app/backend/;
npm install;
cd $DIR;
gulp;
