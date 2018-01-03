
const {JSDOM} = require('jsdom')
const {configure} = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')

configure({adapter: new Adapter()})

const jsdom = new JSDOM('<!doctype html><html><body></body></html>')
const {window} = jsdom

global.window = window
global.document = window.document
global.navigator = {userAgent: 'node.js'}

Object.defineProperties(global, Object.getOwnPropertyNames(window)
  .filter(prop => typeof global[prop] === 'undefined')
  .reduce((result, prop) => ({
    ...result,
    [prop]: Object.getOwnPropertyDescriptor(window, prop),
  }), {}))
