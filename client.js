var reconnect = require('reconnect')
var reloader  = require('client-reloader')
var shasum    = require('shasum')
var Remote    = require('level-scuttlebutt/client')

//memoize the connections so that this works nicely inside http://github.com/dominictarr/demonstrate
var connections = {}

module.exports = function (config) {
  config = config || {}
  var udid = require('udid')(config.name || 'rumours')

  //run on local by default for now...
  //but later, it will be rumours.nearform.com or whatever...

  var host = config.host || window.location.protocol + '//' + window.location.host

  var tmpId = shasum(JSON.stringify([udid, config, host]))

  if(connections[tmpId]) return connections[tmpId]

  config.name = config.name || 'rumours'
  config.prefix = config.prefix || '/rumours'
  var schema = config.schema || require('./schema')
  var remote = Remote(schema, udid)

  var r = reconnect(reloader(function (stream) {
    //this will load the default schema into the bundle,
    //should do this a different way, to avoid that when using custom schemas.
    stream.pipe(remote.createRemoteStream()).pipe(stream)
  }, config)).connect(host + config.prefix)

  connections[tmpId] = r

  r.open = remote.open
  r.view = remote.view
  r._remote = remote
  r.id = udid
  return r
}

