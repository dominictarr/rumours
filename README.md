# Rumours

general purpose scuttlebutt/leveldb server.

Named after my second favorite Fleetwood Mac album.

## Example using defaults

Minimal HTML in `static/index.html`

``` html
<!DOCTYPE HTML>
  <body>
    A Simple Collaborative Text Editor!
    <textarea id=ta cols=80 rows=24></textarea>
  </body>
  <script src=/bundle.js></script>
```

Client Side

``` js
//client.js
var Rumours = require('rumours')
var rumours = Rumours({db: 'demo-text'}) //use the defaults
rumours.open('r-edit_text', function (err, rText) {
 rText.wrap(document.getElementById('ta'))
})
```

Ship It!

``` 
browserify client.js -o static/bundle.js --debug
rumours --static static
google-chrome http://localhost:4567
```

## More Complex Example
see [wikiwiki](https://github.com/dominictarr/wikiwiki)

Uses [collaborative editing](https://github.com/dominictarr/r-edit),
realtime [map-reduce](https://github.com/dominictarr/map-reduce),
[scuttlebucket](https://github.com/dominictarr/scuttlebucket)

## API

todo...

## License

MIT
