var reconnect = require('reconnect')
var reloader  = require('client-reloader')

var Remote    = require('level-scuttlebutt/client')

//putting this inside of page is wrong actually...
//the pushState and the stream are orthagonal.

module.exports = function (config) {
  config = config || {}
  var udid = require('udid')(config.name || 'rumours')

  //run on local by default for now...
  //but later, it will be rumours.nearform.com or whatever...

  var host = config.host || window.location.protocol + '//' + window.location.host

  config.name = config.name || 'rumours'
  config.prefix = config.prefix || '/rumours'
  var schema = config.schema || require('./schema')
  var remote = Remote(schema)

  var r = reconnect(reloader(function (stream) {
    //this will load the default schema into the bundle,
    //should do this a different way, to avoid that when using custom schemas.
    stream.pipe(remote.createRemoteStream()).pipe(stream)
  }, config)).connect(host + config.prefix)

  r.open = remote.open
  r.view = remote.view

  return r
}

