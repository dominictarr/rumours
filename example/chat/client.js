
var Rumours = require('../../')
var chat = require('./chat')

//okay, so next is to make scuttlebutt-remote buffer until it's connected,
//and move buffering to that part - out of level-scuttlebutt.

//port wikiwiki to just use rumours, and more demos.
//a better renderer for r-array,
//and a chat widget.

var client = Rumours() //will connect, and everything.

///*
client.open('model_chat', function (err, appender) {
  if(err) {console.log(err); throw err}
  APPENDER = appender
  console.log('OPEN chat')
  document.body.appendChild(chat(appender))
})//.on('_update', console.log)
//*/

///*
client.open('r-edit_text', function (err, edit) {
  EDIT = edit
  if(err) {console.log(err); throw err}
  console.log('OPEN text')
  edit.wrap(document.getElementById('ta'))
})//.on()
//*/

