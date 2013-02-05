#! /usr/bin/env node
var shoe     = require('shoe')
var join     = require('path').join
var reloader = require('client-reloader')
var through  = require('through')

var Rumours = module.exports = function (config) {
  config = config || {}
  var udid         = require('udid')(config.name || 'rumours')
  var loadDb       = require('./db')(config)

  //inject arbitary authorization about who can access what db here...
  var auth = config.auth || function (meta, cb) {
    console.log('connection', meta.db)
    return cb(null, meta.db)
  }

  var sh = shoe(reloader(function (stream) {
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
  }, {version: config.version}))
  console.log(config)
  var install = sh.install

  sh.install = function (server) {
    install.call(sh, server, config.prefix || '/rumours')
    return server
  }

  return sh
}

if(!module.parent) {
  var http     = require('http')
  var Stack    = require('stack')

  var config = require('rc')('rumours', {
    root: '/tmp/rumours',
    port: 4567,
    static: './static',
  })

  Rumours(config).install(
    http.createServer(ecstatic(config.static))
    .listen(config.port, function () {
      console.log( 'listening on', config.port)
    })
  )
}

