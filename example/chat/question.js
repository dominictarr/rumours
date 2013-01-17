var h = require('h')

module.exports = function (query, focus, cb) {
  if('function' == typeof focus)
    cb = focus, focus = true

  var r = false
  var q, input
  function done () {
    if(r) return
    if(input.value === '')
      return input.focus()
    r = true
    cb.call(q, null, input.value)
    if(q.parentElement)
      q.parentElement.removeChild(q)
  }
  q = h('div.question_widget', 
    query,
    input = h('input.answer', {
        change: function (e) {
        done()
      }, keyup: function (e) {
        if(e.keyCode == 13)
          done()
      }
    }),
    h('button', {
      submit: done
    }, 'enter'
    )
  )
  if(focus) input.focus()

  return q
}
