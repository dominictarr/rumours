//client.js
var Rumours = require('../..')
var rumours = RUMOURS = Rumours({db: 'demo-counter'}) //use the defaults
var h       = require('h')


rumours.open('model_counter', function (err, model) {
  if(err) throw err
  var total

  function inc (char) {
    return h('a', {href: '#', click: function () {
      var val = model.get(rumours.id) || 0
      if(isNaN(val)) val = 0
      model.set(rumours.id, val + (char === '-' ? -1 : 1))
    }}, char)
  }

  //display a counter
  document.body.appendChild(
    h('h1', 
      inc('-'), ' ', 
      total = h('span', {'width-min': '100px'}, update()), 
      ' ', inc('+'))
  )

  function update() {
    var sum = 0
    for(var key in model.store)
      if(!isNaN(Number(model.get(key))))
        sum += (model.get(key) || 0)
    return sum
  }

  model.on('change', function () {
    total.innerHTML = update()
  })

})

