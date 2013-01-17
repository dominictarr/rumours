//client.js
var Rumours = require('../..')
var rumours = Rumours({db: 'demo-text'}) //use the defaults
rumours.open('r-edit_text', function (err, rText) {
  if(err) throw err
  console.log('open', rText)
  rText.wrap(document.getElementById('ta'))
})

