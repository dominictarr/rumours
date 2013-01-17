#! /usr/bin/env bash
browserify rumours.js --debug > static/rumours.js 
browserify rumours.js | uglifyjs > static/rumours.min.js
