var reconnect = require('reconnect')
var reloader  = require('client-reloader')

var Remote    = require('scuttlebutt-remote')

//putting this inside of page is wrong actually...
//the pushState and the stream are orthagonal.

module.exports = function (config) {

  var udid = require('udid')(config.name || 'rumours')

  //run on local by default for now...
  //but later, it will be rumours.nearform.com or whatever...

  var host = config.host || 'http://localhost:3000'
  config.name = config.name || 'rumours'

  var schema = config.schema || require('./schema')
  var remote = Remote(schema)

  console.log('RUMOURS')

  var r = reconnect(reloader(function (stream) {
    //this will load the default schema into the bundle,
    //should do this a different way, to avoid that when using custom schemas.
    console.log('CONNECT')
    stream.on('end', function () {
      console.log('END')
    })
    var rs = stream.pipe(remote.createStream().on('data', function (data) {
      console.log('>>', data)
    }))
    console.log('pipe stream')

    rs.pipe(stream)
    stream.on('data', function (data) {
      console.log('<<', data)
    })

   /* setInterval(function () {
      stream.write(new Date())
    }, 1e3)
    */

  }, config)).connect(host + (config.prefix || '/' + (config.name || 'rumours')))

  r.on('connect', function () {
    console.log('CONNECTION#################')
  })

  r.remote = remote
  return r
}

