
# Alt Redux Logger

A redux logging middleware

## Exports

* `./dist/alt-redux-logger.js` - cjs bundle, transpiled to node4. this is referenced in package.json's main entry
* `./dist/alt-redux-logger.umd.js` - browser bundle, transpiled to ie8.
* `./dist/alt-redux-logger.umd.min.js` - browser bundle minified
* `./es/index.mjs` - es6 module exports. transpiled to node4.

### Polyfills

You'll need the following polyfils if you intend to run this in older browsers / environments:

* Object.entries
* Object.getOwnPropertyDescriptors
* Number.isNaN

## Usage

```js
const {createLogger} = require('alt-redux-logger')
// or import {createLogger} from 'alt-redux-logger/es'
store = createStore(
  combineReducers(...),
  applyMiddleware(
    // e.g., routerMiddleware,
    // e.g., thunkMiddleware,
    createLogger()
  )
)
```

It is recommended you put this AFTER any thunk/promise middleware so you only see the actual actions.

## API

* *createLogger(options: object?)* all options are provided as an object, see below:
    * _logger_ (object, default: console) the logger to use
    * _color_ (boolean, default: true) whether to use colors
    * _diff_ (boolean, default: false) whether to perform a diff
    * _level_ (string, default: 'log') method to use on the logger (throws during initialization if it doesn't exist)
    * _styles_ (object, default: see below) color overrides
    * _format_time_ (function, default: `now => new Date(now).toLocaleString()`) date transformer
    * _predicate_ (function=>boolean, default: `() => true`) used to exclude actions; you get all of payload.
    * _transformer_ (function=>void, default: pretty logger; see below) used to overwrite how log is called

### Transformer

Transformer is used to translate the payload (action, before & after states) from redux into logging statements. It is a function that takes the following 4 parameters.  See [`./src/transformer.js`](./src/transformer.js) for how the pretty logger does it.

* *logger* - the loger instance provided to `createLogger` (by default, this is console)
* *payload* - all the information available
    * _action_ - the redux action
    * _before_ - store before the action
    * _after_ - store after the action
    * _diff?_ - array of differences (if diff option is true)
    * _error?_ - error, if encountered
    * _now_ - milliseconds since Jan. 1., 1970
    * _took_ - milliseconds the action took to perform
* *support* - rudimentary support checking (see [`./src/support.js`](./src/support.js))
* *options* - all options provided to the logger

### Styles

If using the pretty logger, you can overwrite certain colors. Each object supports:

* `color` - rgb hex code
* `dim` - boolean, font-weight: lighter in browser; dim in console
* `bold` - boolean, font-weight: bold in browser, bold in console

Here are the defaults:

```json
{
  "title": {"color": "#666", "dim": true},
  "title_action": {"color": "#fff", "bold": true},
  "prev": {"color": "#9E9E9E", "bold": true},
  "action": {"color": "#03A9F4", "bold": true},
  "error": {"color": "#F20404", "bold": true},
  "next": {"color": "#4CAF50"},
  "diff": {"bold": true},
  "diff_add": {"color": "#4CAF50"},
  "diff_remove": {"color": "#F44336"},
  "diff_update": {"color": "#2196F3"}
}
```


## But Why?

Why not just use [redux-logger](https://github.com/evgenyrodionov/redux-logger)?  This works great for development in the browser, but fails short on the server and in production environments.

* No "don't use a pretty logger at all, `JSON.stringify` everything and do one log per action" option. I take a different approach to transformations - a default transformer is provided that is pretty, you can overwrite its colors -- or you can use your own transformer, e.g. `transfomer: (logger, payload) => logger.log(JSON.stringify(payload))`.

* No console coloring support. Bringing in something like chalk to a browser bundle seems a bit heavy handed, so I wrote a [very minimal coloring library](https://github.com/tswaters/tiny-ansi-colors) to support the very basics.

That said, this module is heavily inspired by `redux-logger` - at least with the default options emulating the browser logging... this was written from scratch.

## TODO

* [ ] fix edge/ie - these don't support multiple params or colors in group - need to determine this and us a single parameter.

* [ ] provide a state transformer for before/after/error to turn immutablejs back to pojo prior to logging.

* [ ] clean up & publish to npm
