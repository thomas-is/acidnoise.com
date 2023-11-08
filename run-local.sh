#!/bin/sh

port=8080
echo "http://localhost:$port"
docker run --rm -it --name acidnoise \
  -v $(pwd)/srv:/srv \
  -v $(pwd)/nginx.conf:/etc/nginx/http.d/default.conf \
  -p $port:80 0lfi/ng-php7
