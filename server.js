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
  var udid         = require('udid')(config.name || 'rumours')
  var loadDb       = require('./db')()

  shoe(reloader(function (stream) {
    console.log('connection')
    var ts = through().pause()
    
//    stream.pipe(ts)
//    stream.on('data', console.log)

    var dbName = stream.meta.db
    var db = loadDb(dbName, function (err, db) {
      console.log('LOADED DB', db.remote)
      if(err) {
        console.error(err)
        stream.end()
        ts.resume()
        return
      }

      //ts.pipe(db.remote.createStream()).pipe(stream)
      //ts.resume()
    })

    stream.pipe(db.remote.createStream()).pipe(stream)

  })).install(
    http.createServer(ecstatic(config.static))
     .listen(config.port, function () {
      console.log( 'listening on', config.port)
    })
  , config.prefix || '/' + (config.name || 'rumours'))
}

if(!module.parent)
  module.exports(require('./config'))
