#!/bin/sh

docker run --rm -d --name acidnoise \
  -v $(pwd)/srv:/srv \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf \
  -p 8080:80 0lfi/ng-php7
