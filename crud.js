var deepEqual = require('deep-equal')

module.exports = function (rumours) {

    function open(fun) {
      return function (base, name, json, cb) {
        if(!cb) cb = json, json = null
        rumours.openDb(base, function (err, db) {
          if(err) return cb(err)
          db.scuttlebutt.open(name, function (err, model) {
            if(err) return cb(err)
            fun(model, json, cb)
          })
        })
      }
    }

    function clearNull (obj) {
      var o = {}
      for(var k in obj) {
        if(obj[k] != null)
          o[k] = (
            'object' === typeof obj[k]
            ? clearNull(obj[k])
            : obj[k]
          )
      }
      return o
    }

    var mergers = {
      model: function (model, obj) {
        for(var k in obj) {
          if(!deepEqual(obj[k], model.get(k)))
            model.set(k, obj[k])
        }
      },
      crdt: function (model, obj) {
        var all = {}
        for(var k in obj) {
          var row = model.get(k)
          var _row = obj[k]
          if('object' === typeof _row)
            throw new Error('crdt rows must be objects')
          if(_row === null) {
            all[j] = null
          } else {
            var change = {}
            for(var j in _row) {
              if(!deepEqual(_row[j], row.get(j)))
                change[j] = _row[j]
            }
            all[j] = change
          }
        }

        //save up changes until the end in case there was an error
        for(var k in all)
          model.get(k).set(all[k])
      }
    }

    var deleters = {
      model: function (model, obj) {
        console.log('predel', model.toJSON())
        model.each(function (_, k) {
          model.set(k, null)
        })
        console.log('postdel', model.toJSON())
      },
      crdt: function (model, obj) {
        for(var k in model.rows)
          model.set(k, null)
      }
    }

    function getOp (name, ops) {
      for(var k in ops)
        if(name.indexOf(k) == 0)
          return ops[k]
      return null
    }

    //currently, assuming
    var update
    return {
      //update is the same as create
      create: update = open(function (model, obj, cb) {
        var merge = getOp(model.name, mergers)

        if(!merge) 
          return cb(new Error('update/create'
          + ' operation not yet supported on this type!'))

        try {
          merge(model, obj)
        } catch (err) { return cb(err) }

        cb(null, model.toJSON())
      }),

      read: open(function (model, _, cb) {
        cb(null, clearNull(model.toJSON()))
      }),

      update: update,

      "delete": open(function (model, _, cb) {
        var del = getOp(model.name, deleters)

        if(!del) 
          return cb(new Error('delete'
          + 'operation not yet supported on this type!'))

        try {
          del(model)
        } catch (err) { return cb(err) }

        cb(null)
      })
    }
}
