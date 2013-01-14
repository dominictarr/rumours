var reconnect = require('reconnect')
var reloader  = require('client-reloader')

var Remote    = require('scuttlebutt-remote')

//putting this inside of page is wrong actually...
//the pushState and the stream are orthagonal.

module.exports = function (config) {

  var udid = require('udid')(config.name || 'rumours')

  //run on local by default for now...
  //but later, it will be rumours.nearform.com or whatever...

  var host = config.host || window.location.host + '//' + window.location.host

  config.name = config.name || 'rumours'

  var schema = config.schema || require('./schema')
  var remote = Remote(schema)

  var r = reconnect(reloader(function (stream) {
    //this will load the default schema into the bundle,
    //should do this a different way, to avoid that when using custom schemas.
    stream.pipe(remote.createStream()).pipe(stream)
  }, config)).connect(host + (config.prefix || '/' + (config.name || 'rumours')))


  r.open = remote.open
  r.view = remote.view
  r.remote = remote

  return r
}

