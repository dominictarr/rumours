#! /usr/bin/env node
var shoe     = require('shoe')
var ecstatic = require('ecstatic')
var http     = require('http')
var join     = require('path').join
var reloader = require('client-reloader')
var Remote   = require('scuttlebutt-remote')
var through  = require('through')

//var config   = require('./config')

var fs = require('fs')

module.exports = function (config) {
  config = config || {}
  var udid         = require('udid')(config.name || 'rumours')
  var loadDb       = require('./db')(config)

  var server =  http.createServer(ecstatic(config.static))

  shoe(reloader(function (stream) {    
    var dbName = stream.meta.db
    var db = loadDb(dbName, function (err) {
      if(err) {
        console.error(err)
        stream.end()
      }
    })

    stream.pipe(db.remote.createStream()).pipe(stream)

  })).install(server, config.prefix || '/' + (config.name || 'rumours'))

  return server
}

if(!module.parent)
  module.exports(require('./config'))
    .listen(config.port, function () {
      console.log( 'listening on', config.port)
    })

