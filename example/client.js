
var rumours = require('../client')

rumours({username: 'dominic', name: 'hello', host: 'http://localhost:4567'})
  .on('client', function (client) {
    console.log('CLIENT', client)
    client.open('r-edit_text', function (err, edit) {
      if(err) {console.log(err); throw err}
      console.log('EDIT')
      console.log(document.getElementById('ta'))
      edit.wrap(document.getElementById('ta'))
    })
  })
