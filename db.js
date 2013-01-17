var levelup = require('levelup')
var join    = require('path').join
var LevelScuttlebutt 
            = require('level-scuttlebutt')
var udid    = require('udid')('sync')
var shasum  = require('shasum')

var config  = require('./config')
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

  console.log(config.schema)

  //just a simple count of all items.
  var views  = config.views || [
    {
      name: 'all',
      map: function (key, model, emit) {
        emit(model.name, 1)
      },
      reduce: function (acc, item) {
        return Number(acc) + Number(item)
      },
      initial: 0
    }
  ]

  return function (name, cb) {

    if(dbs[name]) {
      return whenReady(dbs[name], cb)
    }
    var dir = join(config.root, name)
    var db = levelup(dir, {createIfMissing: true})

    //don't give each database the same hash,
    //that will reveal that they are on the same server to attackers.
    var id = shasum(udid + name)
    LevelScuttlebutt(db, id, config.schema)
    if(config.views)
      config.views.forEach(db.scuttlebutt.addMapReduce)

    dbs[name] = db

    whenReady(dbs[name], cb)
    return db
  }
}

