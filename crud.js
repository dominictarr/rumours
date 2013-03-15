var deepEqual = require('deep-equal')
var through   = require('through')

module.exports = function (rumours) {

  function hasKeys (obj) {
    for(var k in obj)
      return true
    return false
  }

  function open(fun) {
    return function (base, name, json, cb) {
      if(!cb) cb = json, json = null
      rumours.openDb(base, function (err, db) {
        if(err) return cb(err)
        db.scuttlebutt.open(name, function (err, model) {
          if(err) return cb(err)
          fun.call(db, model, json, cb)
        })
      })
    }
  }

  function openView(fun) {
    return function (base, name, json, cb) {
      var rs = through()
      rs.write = rs.end = rs.writable = false;

      if(!cb) cb = json, json = null
      rumours.openDb(base, function (err, db) {
        if(err) return cb(err)
        fun(db.createReadStream(), db, cb)  
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
    'r-value': function (model, obj) {
      model.set(obj)
    },
    model: function (model, obj) {
      for(var k in obj) {
        if('function' !== typeof obj[k]
          && !deepEqual(obj[k], model.get(k))
        ) model.set(k, obj[k])
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
            if('function' !== typeof _row[j]
              && !deepEqual(_row[j], row.get(j))
            )
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
    'r-value': function (model) {
      model.set(null)
    },
    model: function (model) {
      model.each(function (_, k) {
        model.set(k, null)
      })
    },
    crdt: function (model) {
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

      var obj = model.toJSON()
      model.dispose()
      this.once('drain', function () {
        console.log('drain')
        cb(null, obj)
      })
    }),

    read: open(function (model, _, cb) {
      var obj = model.toJSON()
      model.dispose()
      obj = clearNull(obj)
      cb(null, hasKeys(obj) ? obj : null)
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

      var obj = model.toJSON()
      model.dispose()
      this.once('drain', function () {
      console.log('DRAIN DELET')
        cb(null, obj)
      })
    }),
    list:  function (base, name, json, cb) {
      var ms
      if(!cb) cb = json, json = null
      var db = rumours.openDb(base, function (err, db) { })

      var a = []
      db.createReadStream()
        .pipe(ms = through(function(data) {
          var obj = JSON.parse(data.value)
          if(!hasKeys(obj)) return
          obj._id = data.key
          this.queue(obj)
          a.push(obj)
        }, function () {

          if(cb) cb(null, a)
        }))

      db.on('error', function (err) {
        if(cb) cb(err)
        else   ms.emit('error', err)
      })

      return ms
    }
  }
}
