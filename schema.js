function create (con) {
  return function () {
    return new con()
  }
}

//all the scuttlebutt subclasses written so far.

module.exports = require('scuttlebutt-schema')({
  'model': create(require('scuttlebutt/model')),
  'events': create(require('scuttlebutt/events')),
  'r-edit': create(require('r-edit')),
  'r-array': create(require('r-array')),
  'crdt': create(require('crdt'))
  //,
  //can't use this until @Raynos updates them to scuttlebutt ~5.5
  //'append-only': create(require('append-only')),
  //'expiry-model': create(require('expiry-model'))
})

