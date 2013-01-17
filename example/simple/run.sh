#!/usr/bin/env bash
browserify client.js -o static/bundle.js --debug
../../server.js --static static
echo google-chrome http://localhost:4567

