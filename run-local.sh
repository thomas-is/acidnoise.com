#!/bin/sh

docker run --rm -it --name acidnoise \
  -v $(pwd)/srv:/srv \
  -v $(pwd)/nginx.conf:/etc/nginx/http.d/default.conf \
  -p 8080:80 0lfi/ng-php7
