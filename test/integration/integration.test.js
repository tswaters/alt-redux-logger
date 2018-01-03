
/* eslint-disable no-console */

import assert from 'assert'
import sinon from 'sinon'
import {createStore, addItem, removeItem, reset, error} from './redux'
import {createLogger} from '../../src'

describe('integration test', () => {

  const logger = {
    log: sinon.spy(function () { console.log(...arguments) }),
    group: sinon.spy(function () { console.log(...arguments) }), // old node doesn't support group
    groupEnd: sinon.spy(function () { console.log(...arguments) }), // old node doesn't support groupEnd
  }

  afterEach(() => {
    logger.log.reset()
    logger.group.reset()
    logger.groupEnd.reset()
  })

  it('should function properly with redux', () => {

    const store = createStore(
      createLogger({
        logger,
        diff: true,
        predicate: payload => payload.action.type !== 'ERROR'
      })
    )
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
    assert.equal(logger.log.callCount, 48)
    assert.equal(logger.group.callCount, 18)
    assert.equal(logger.groupEnd.callCount, 18)

  })

})
