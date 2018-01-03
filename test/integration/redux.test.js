
import assert from 'assert'
import {createStore, addItem, removeItem, reset, error} from '../fixtures/redux'
import logger, {reset as logger_reset} from '../fixtures/logger'
import {createLogger} from '../../src'

describe('redux integration', () => {

  afterEach(() => {
    logger_reset()
  })

  it('should function properly with redux', () => {

    const store = createStore(
      createLogger({
        logger,
        diff: true,
        predicate: (getState, action) => action.type !== 'RESET',
        diffPredicate: (getState, action) => action.type !== 'REMOVE_ITEM'
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
    assert.equal(logger.group.callCount, 15)
    assert.equal(logger.groupEnd.callCount, 15)

  })

})
