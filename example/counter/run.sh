#!/usr/bin/env bash
{
  echo '<!DOCTYPE HTML><html><body></body><script>'
  browserify client.js --debug || exit 1
  echo '</script></html>'
} > static/index.html
../../server.js --static static
echo google-chrome http://localhost:4567

