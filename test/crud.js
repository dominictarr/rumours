var test = require('tape')

var Rumours = require('../server')
var rumours = Rumours({
  root:'/tmp/rumours-test',
  name: 'TEST'
//  port: ~~(Math.random()*40000)
})

var Crud = require('../crud')

test('crud', function (t) {

  var crud = Crud(rumours)

  crud.create('test', 'model!test1', {
    r1: r = Math.random()
  }, function (err) {
    if(err) throw err
    crud.read('test', 'model!test1', function (err, obj) {
      if(err) throw err
      console.log(obj)

      t.deepEqual(obj, {r1: r})

      crud.delete('test', 'model!test1', function (err) {
        if(err) throw err
        crud.read('test', 'model!test1', function (err, obj) {
          if(err) throw err
          console.log('after delete', obj)
          t.deepEqual(obj, {})
          t.end()
        })
      })
    })
  })
})
