#! /usr/bin/env node
var shoe     = require('shoe')
var ecstatic = require('ecstatic')
var http     = require('http')
var join     = require('path').join
var reloader = require('client-reloader')
var through  = require('through')
var Stack    = require('stack')

var fs = require('fs')

module.exports = function (config) {
  config = config || {}
  var udid         = require('udid')(config.name || 'rumours')
  var loadDb       = require('./db')(config)

  var server =  http.createServer(Stack(
        ecstatic(config.static || './static'),
        ecstatic(join(__dirname, 'static'))
      ))

  //inject arbitary authorization about who can access what db here...
  var auth = config.auth || function (meta, cb) {
    console.log('connection', meta)
    return cb(null, meta.db)
  }

  shoe(reloader(function (stream) {
    var ts = through().pause(), s

    function error(err) {
      if(err) {
        console.error(err)
        ts.end(); ts.resume()
        if(s) s.end()
        stream.end()
      }
    }

    auth(stream.meta, function (err, name) {
      if(err) return error(err)
      var db = loadDb(name, function (err) {
        if(err) return error(err)
        ts.resume()
      })
      ts.pipe(s = db.scuttlebutt.createRemoteStream()).pipe(stream)
    })

    stream.pipe(ts)
  })).install(server, config.prefix || '/rumours')

  return server
}

if(!module.parent) {
  var config = require('./config')
  module.exports(config)
    .listen(config.port, function () {
      console.log( 'listening on', config.port)
    })
}

