# Alt Redux Logger

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![Dependency Status][dependency-badge]][dependency-url]
[![devDependency Status][devDependency-badge]][devDependency-url]

A redux logging middleware

## Exports

* `./dist/alt-redux-logger.js` - cjs bundle, transpiled to node4. referenced in package.json's main entry
* `./dist/alt-redux-logger.mjs` - es6 exports. transpiled to node4. referenced in package.json's module entry
* `./dist/alt-redux-logger.umd.js` - browser bundle, transpiled to ie8.
* `./dist/alt-redux-logger.umd.min.js` - browser bundle minified

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
    * _diffPredicate_ (function=>boolean, default: `() => true`) used to exclude diffs; you get (getState, action).
    * _level_ (string, default: 'log') method to use on the logger (throws during initialization if it doesn't exist)
    * _styles_ (object, default: see below) color overrides
    * _formatTime_ (function, default: `now => new Date(now).toLocaleString()`) date transformer
    * _predicate_ (function=>boolean, default: `() => true`) used to exclude actions; you get (getState, action).
    * _createPrinter_ (function=>void, default: pretty; see below) used to overwrite how log is called
    * _stateTransformer_ (function=>*, default: `state => state`) used to transform state prior to hitting logger
    * _actionTransformer_ (function=>*, default: `action => action`) used to transform action prior to hitting logger
    * _errorTransformer_ (function=>*, default: `error => error`) used to transform error prior to hitting logger

### Printer

Printer is used to translate the payload (action, before & after states) from redux into logging statements. It is a function that takes the following 2 parameters, `support` and `options`.

* *support* - rudimentary support checking (see [`./src/support.js`](./src/support.js))
* *options* - all options provided to the logger

It can return one of two things:

* _function_ - if a function is provided, it will be called with `logger` and `payload`
  * *logger* - the loger instance provided to `createLogger` (by default, this is console)
  * *payload* - all the information available
    * _action_ - the redux action
    * _before_ - store before the action
    * _after_ - store after the action
    * _diff?_ - array of differences (if diff option is true)
    * _error?_ - error, if encountered
    * _now_ - milliseconds since Jan. 1., 1970
    * _took_ - milliseconds the action took to perform
* _object_ - if an object is provided, it is expected to have lifecycle functions that will be called at the appropriate time. The following functions can be provided - they will be called in this order:
  * *start* ((logger, action, now)=>void) called when an operation starts (sets up console.group)
  * *before* ((logger, before)=>void) called to log the state before the action occurs
  * *action* ((logger, action)=>void) called to log the action that occurs
  * *after* ((logger, after)=>void) called to log the state after the action occurs
  * *error* ((logger, error)=>void) called when an error occurs
  * *diff* ((logger, diff)=>void) called with an array of changes if `diff` and `diffPredicate` are true.
  * *end* ((logger, took)=>void) called when an operation ends (closes console.group)

See [`./src/printer.js`](./src/printer.js) for how the pretty printer does it.

### Styles

If using the pretty logger, you can overwrite certain colors. Each object supports:

* `color` - rgb hex code
* `dim` - boolean, font-weight: lighter in browser; dim in console
* `bold` - boolean, font-weight: bold in browser, bold in console

Here are the defaults:

```json
{
  "title": {"color": "#666", "dim": true},
  "titleAction": {"bold": true},
  "prev": {"color": "#9E9E9E", "bold": true},
  "action": {"color": "#03A9F4", "bold": true},
  "error": {"color": "#F20404", "bold": true},
  "next": {"color": "#4CAF50"},
  "diff": {"bold": true},
  "diffAdd": {"color": "#4CAF50"},
  "diffRemove": {"color": "#F44336"},
  "diffUpdate": {"color": "#2196F3"}
}
```


## But Why?

Why not just use [redux-logger](https://github.com/evgenyrodionov/redux-logger)?  This works great for development in the browser, but fails short on the server and in production environments.

* No "don't use a pretty logger at all, `JSON.stringify` everything and do one log per action" option. I take a different approach to printing - a default printer is provided that is pretty, you can overwrite its colors -- or you can use your own printer, e.g. `printer: (options, support) => (logger, payload) => logger.log(JSON.stringify(payload))`.

* No console coloring support. Bringing in something like chalk to a browser bundle seems a bit heavy handed, so I wrote a [very minimal coloring library](https://github.com/tswaters/tiny-ansi-colors) to support the very basics.

That said, this module is heavily inspired by `redux-logger` - at least with the default options emulating the browser logging... this was written from scratch.

## TODO

* [ ] publish to npm

[npm-badge]: https://badge.fury.io/js/alt-redux-logger.svg
[npm-url]: https://badge.fury.io/js/alt-redux-logger
[travis-badge]: https://travis-ci.org/tswaters/alt-redux-logger.svg?branch=master
[travis-url]: https://travis-ci.org/tswaters/alt-redux-logger
[coveralls-badge]: https://coveralls.io/repos/github/tswaters/alt-redux-logger/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/tswaters/alt-redux-logger?branch=master
[dependency-badge]: https://david-dm.org/tswaters/alt-redux-logger.svg
[dependency-url]: https://david-dm.org/tswaters/alt-redux-logger
[devDependency-badge]: https://david-dm.org/tswaters/alt-redux-logger/dev-status.svg
[devDependency-url]: https://david-dm.org/tswaters/alt-redux-logger?type=dev
