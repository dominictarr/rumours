var test = require('tape')
var rimraf = require('rimraf')

rimraf('/tmp/rumours-test', function () {

  var Rumours = require('../server')
  var rumours = Rumours({
    root:'/tmp/rumours-test',
    name: 'TEST'
  })

  //var Crud = require('../crud')

  test('crud', function (t) {

    var crud = rumours

    crud.create('test', 'model!test1', {
      r1: r = Math.random()
    }, function (err, obj) {
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
            t.deepEqual(obj, null)
            crud.list('test', 'model', function (err, list) {
              if(err) throw err
              console.log('LIST', list)
              t.equal(list.length, 0)
              t.end()
            })
          })
        })
      })
    })
  })

  test('crud-list', function (t) {

    var crud = rumours, r1, r2, r3

    crud.create('test', 'model!test_1', r1 = {
      val: Math.random()
    }, next)
    crud.create('test', 'model!test_2', r2 = {
      val: Math.random()
    }, next)
    crud.create('test', 'model!test_3', r3 ={
      val: Math.random()
    }, next)

    var n = 3
    function next () {
      console.log('NEXT', n)
      if(--n) return
      var list = []

      console.log('LIST')
      crud.list('test', 'model')
      .on('data', function (data) {
        console.log('data', data)
        if(/_\d$/.test(data._id))
          list.push(data)
      })
      .on('end', function () {
        t.equal(list[0].val, r1.val)
        t.equal(list[1].val, r2.val)
        t.equal(list[2].val, r3.val)
        console.log('END')
        t.end()
      })

    }

  })

})
