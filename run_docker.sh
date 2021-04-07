#!/usr/bin/env bash

docker system prune --force
docker run --name redis_bot -p 6666:6379 -d redis

