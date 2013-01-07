var levelup = require('levelup')
var join    = require('path').join
var mkdirp  = require('mkdirp')
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
}

module.exports = function (name, cb) {
  if(dbs[name])
    return whenReady(dbs[name], cb)

  var dir = join(config.root, name)
  mkdirp(dir, function (err) {
    if(err) return cb(err)

    var db = levelup(dir, {createIfMissing: true})

    //don't give each database the same hash,
    //that will reveal that they are on the same server to attackers.
    var id = shasum(udid + name)
    LevelScuttlebutt(db, id, schema)

    //just a simple count of all items.
    db.scuttlebutt.addMapReduce({
      name: 'all',
      map: function (key, model, emit) {
        emit(model.name, 1)
      },
      reduce: function (acc, item) {
        return Number(acc) + Number(item)
      },
      initial: 0
    })

    dbs[name] = db

    whenReady(dbs[name], cb)
  })
}
