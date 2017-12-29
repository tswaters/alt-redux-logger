
/* eslint-disable no-console */

import assert from 'assert'
import sinon from 'sinon'
import {createStore, addItem, removeItem, reset, error} from './redux'
import {createLogger} from '../../src'

describe('integration test', () => {

  before(() => {
    sinon.spy(console, 'log')
    sinon.spy(console, 'group')
    sinon.spy(console, 'groupEnd')
  })

  afterEach(() => {
    console.log.reset()
    console.group.reset()
    console.groupEnd.reset()
  })

  after(() => {
    console.log.restore()
    console.group.restore()
    console.groupEnd.restore()
  })

  it('should function properly with redux', () => {

    const logger = createLogger({
      diff: true,
      predicate: payload => payload.action.type !== 'ERROR'
    })

    const store = createStore(logger)
    store.dispatch(addItem('item #1'))
    store.dispatch(addItem('item #2'))
    store.dispatch(removeItem(1))
    store.dispatch(reset())
    store.dispatch(addItem('item #3'))
    store.dispatch(addItem('item #1'))
    store.dispatch(addItem('item #2'))
    store.dispatch(removeItem(0))
    store.dispatch(removeItem(1))
    try {
      store.dispatch(error(new Error('aw snap!')))
    } catch (_) { /* don't throw m'kay */}

    // there's no way i'm asserting all of these.
    // the output from console should show if something is wrong.
    assert.equal(console.log.callCount, 66)
    assert.equal(console.group.callCount, 18)
    assert.equal(console.groupEnd.callCount, 18)

  })

})
