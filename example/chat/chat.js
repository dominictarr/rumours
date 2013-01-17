var question   = require('./question')
var AppendOnly = require('append-only')
var h          = require('h')

module.exports = function (model, template) {
  var messages, input

  MODEL = model

  console.log(model)

  template = template || function (message) {
    return h('tr.message', h('td.user',message.user), h('td.text', message.text))
  }

  var chat = h('div.chat_widget', 
    question('username?', function (err, name) {
      chat.appendChild(messages = h('table.messages'))
      chat.appendChild(input = h('input', {
        keyup: function (e) {
          if(input.value == '') return
          if(e.keyCode !== 13) return //enter
          console.log('model', model)
          model.set(Date.now(), {user: name, text: input.value})
          input.value = ''
          input.focus()
        }
      }))

      function add (_, item) {
        console.log('change', item)
        messages.appendChild(template(item))
      }

      model.on('change', add)
      Object.keys(model.store).forEach(function (k) {
        add(k, model.get(k))
      })
    })
  )
  return chat
}
