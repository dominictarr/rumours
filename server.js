#! /usr/bin/env node
var shoe     = require('shoe')
var join     = require('path').join
var reloader = require('client-reloader')
var through  = require('through')
var ecstatic = require('ecstatic')
var stack    = require('stack')
var CRUD     = require('./crud')

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

  var install = sh.install

  sh.install = function (server) {
    install.call(sh, server, config.prefix || '/rumours')
    return server
  }

  sh.openDb = function (name, cb) {
    return loadDb(name, cb)
  }

  var crud = CRUD(sh)

  for(var k in crud)
    sh[k] = crud[k]

  sh.REST = function (req, res, next) {
    //TODO replace this with ./crud.js

    if(req.method.toLowerCase() !== 'get') return next()
    var url = req.url.substring(1).split('/')
    if(url.shift() !== 'db') return next()
    var db = url.shift()
    //add more features
    auth({db: db, headers: req.headers}, function (err, name) {
      if(err) return next(err)
      loadDb(name, function (err, db) {
        db.scuttlebutt.open(url.join('!'), function (err, sb) {
          if(err) return next(err)
          res.writeHead(200, {'Content-type': 'application/json'})
          res.end(JSON.stringify(sb.toJSON()) + '\n')
          console.log(sb)
          //sb.dispose()
          sb.on('update', function () {
            console.log(sb)
          })
        })
      })
    })
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

  var rumours = Rumours(config)
  rumours.install(
    http.createServer(stack(
      rumours.REST,
      ecstatic(config.static)
    ))
    .listen(config.port, function () {
      console.log( 'listening on', config.port)
    })
  )
}

