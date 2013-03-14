var levelup   = require('levelup')
var SubLevel  = require('level-sublevel')
var LevelScuttlebutt 
              = require('level-scuttlebutt')
var MapReduce = require('map-reduce')

var join      = require('path').join
var udid    = require('udid')('rumours')
var shasum  = require('shasum')
var mkdirp  = require('mkdirp')

var schema  = require('./schema')

var dbs = {}

function whenReady (db, cb) {
  if(db.isOpen()) cb(null, db)
  function onReady () {
    db.removeListener('error', onError)
     cb(null, db)
  }
  function onError (err) {
    db.removeListener('ready', onReady)
    cb(err)
  }
  db.once('ready', onReady)
  db.once('error', onError)
  return db
}

module.exports = function (config) {
  config = config || {
    root: '/tmp/rumours-default'
  }

  config.schema = config.schema || require('./schema')

  mkdirp.sync(config.root)

  //just a simple count of all items.
  var views  = config.views = config.views || [
    {
      name: 'all',
      map: function (key, model, emit) {
        if(model.name) {
          emit(key.split('!'), 1)
        }
      },
      reduce: function (acc, item) {
        return Number(acc) + Number(item)
      },
      initial: 0
    },
    {
      name: 'ids',
      map: function (key, model, emit) {
          emit('id', 1)
      },
      reduce: function (acc, item) {
        return Number(acc) + Number(item)
      },
      initial: 0
    },
  ]

  return function (name, cb) {

    if(dbs[name]) {
      return whenReady(dbs[name], cb)
    }

    var dir = join(config.root, name)
    var db = levelup(dir, {createIfMissing: true})
    SubLevel(db)
    //don't give each database the same hash,
    //that will reveal that they are on the same server to attackers.
    var id = shasum(udid + name)
    LevelScuttlebutt(db, id, config.schema)
    if(config.views) {
      config.views.forEach(function (view) {
        db.views[view.name] =
          MapReduce(db, view.name, view.map, view.reduce, view.initial)
          .on('reduce', console.log)
      })
    }

    dbs[name] = db

    whenReady(dbs[name], cb)
    return db
  }
}

