#!/bin/bash

base=$( realpath $( dirname $0 ) )
port=8080
echo "http://localhost:$port"
docker run --rm -it --name acidnoise \
  -v $base/srv:/srv \
  -v $base/nginx.conf:/etc/nginx/http.d/default.conf \
  -p $port:80 \
  0lfi/ng-php8
