#! /usr/bin/env node
var shoe     = require('shoe')
var ecstatic = require('ecstatic')
var http     = require('http')
var join     = require('path').join
var reloader = require('client-reloader')
var Remote   = require('scuttlebutt-remote')
var through  = require('through')

var config   = require('./config')
var db       = require('./db')

var udid = require('udid')('sync')

var fs = require('fs')

shoe(reloader(function (stream) {
  var ts = through().pause()
  stream.pipe(ts)
  var dbName = stream.meta.db
  db(dbName, function (err, db) {
    if(err) {
      stream.end()
      ts.resume()
      return
    }
    ts.pipe(Remote(db)).pipe(stream)
    ts.resume()    
  })
})).install(
  http.createServer(ecstatic(join(process.cwd(), 'static')))
   .listen(config.port, function () {
    console.log( 'listening on', config.port)
  })
, '/sync')

