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

  shoe(reloader(function (stream) {    
    console.log('connection')
    var dbName = stream.meta.db
    var db = loadDb(dbName, function (err) {
      if(err) {
        console.error(err)
        stream.end()
      }
    })
    var s
    stream.pipe(s = db.scuttlebutt.createRemoteStream()).pipe(stream)
    stream.pipe(process.stderr, {end: false})
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

