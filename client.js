var reconnect = require('reconnect')
var reloader  = require('client-reloader')
var header   = require('header-stream')

var schema    = require('./schema')
var Remote    = require('scuttlebutt-remote')

console.log('schema', schema)

var udid = require('udid')('sync')

//putting this inside of page is wrong actually...
//the pushState and the stream are orthagonal.

module.exports = function (meta) {

  //run on local by default for now...
  //but later, it will be rumours.nearform.com or whatever...

  var host = meta.host || 'http://localhost:3000'

  if(!meta.name) throw new Error('must provide db name')

  var r = reconnect(reloader(function (stream) {
    console.log('connection', stream)
    var client = Remote(schema)
    stream.pipe(client).pipe(stream)
    r.emit('client', client)
  }, meta)).connect(host + '/sync')

  r.on('client', function (client) {
    console.log('client', client)
  })

  return r
}



