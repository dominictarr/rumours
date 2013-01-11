
var rumours = require('../client')

//okay, so next is to make scuttlebutt-remote buffer until it's connected,
//and move buffering to that part - out of level-scuttlebutt.

//port wikiwiki to just use rumours, and more demos.
//a better renderer for r-array,
//and a chat widget.

var client = rumours({username: 'dominic', host: 'http://localhost:4567'}).remote

client.open('r-edit_text', function (err, edit) {
  if(err) {console.log(err); throw err}
  console.log('EDIT')
  console.log(document.getElementById('ta'))
  edit.wrap(document.getElementById('ta'))
})

