
import assert from 'assert'
import {createStore, addItem, removeItem, reset, error} from '../fixtures/redux'
import logger, {reset as logger_reset} from '../fixtures/logger'
import {createLogger} from '../../src'

describe('redux integration', () => {
  let store = null

  beforeEach(() => {
    store = createStore(
      createLogger({
        logger,
        diff: true,
        formatTime: now => new Date(now).toJSON(),
        predicate: (getState, action) => action.type !== 'RESET',
        diffPredicate: (getState, action) => action.type !== 'REMOVE_ITEM'
      })
    )
  })

  afterEach(() => {
    logger_reset()
  })

  it('should function properly with redux', () => {

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

  it('should support multiple args passed to dispatch', () => {
    store.dispatch({type: 'multiple'}, {meta: 'extra'})
    assert.equal(logger.log.callCount, 5)
    assert.deepEqual(logger.group.args[0], [
      '\u001b[90m\u001b[2maction\u001b[22m\u001b[39m',
      '\u001b[1mmultiple\u001b[22m',
      '\u001b[90m\u001b[2m@ 1970-01-01T00:00:00.000Z\u001b[22m\u001b[39m'
    ])
    assert.deepEqual(logger.log.args[0], ['\u001b[37m\u001b[1mprev state\u001b[22m\u001b[39m', {items: [], index: 0}])
    assert.deepEqual(logger.log.args[1], ['\u001b[96m\u001b[1maction    \u001b[22m\u001b[39m', {type: 'multiple'}, {meta: 'extra'}])
    assert.deepEqual(logger.log.args[2], ['\u001b[32mnext state\u001b[39m', {items: [], index: 0}])
    assert.deepEqual(logger.log.args[3], ['--no diff--'])
    assert.deepEqual(logger.log.args[4], ['\u001b[90m\u001b[2m(took 0 ms)\u001b[22m\u001b[39m'])
    assert.deepEqual(logger.groupEnd.args[0], ['--end diff--'])
    assert.deepEqual(logger.groupEnd.args[1], ['--log end--'])
    assert.equal(logger.group.callCount, 2)
    assert.equal(logger.groupEnd.callCount, 2)
  })

})
