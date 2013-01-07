
var rumours = require('../client')

rumours({username: 'dominic', name: 'hello'})
  .on('client', function (client) {
    console.log('CLIENT', client)
    client.open('r-edit_text', function (err, edit) {
      if(err) {console.log(err); throw err}
      console.log('EDIT')
      edit.wrap(document.getElementById('text'))
    })
  })
