
import assert from 'assert'
import sinon from 'sinon'

import {createLogger} from '../../src'
import * as diff from '@tswaters/tiny-diff'
import * as support from '../../src/support'
import * as transformer from '../../src/transformer'

describe('createLogger', () => {

  let clock = null
  const store = {getState: sinon.stub()}
  const action = {type: 'ACTION!'}
  const next = sinon.stub()

  before(() => {
    sinon.stub(diff, 'diff')
    sinon.stub(transformer, 'transformer')
    sinon.stub(support, 'get_support')
    clock = sinon.useFakeTimers({now: 0, toFake: ['Date']})
  })

  beforeEach(() => {
    support.get_support.returns({console: true, groupColors: true})
  })

  afterEach(() => {
    store.getState.reset()
    support.get_support.reset()
    transformer.transformer.reset()
  })

  after(() => {
    diff.diff.restore()
    transformer.transformer.restore()
    support.get_support.restore()
    clock.restore()
  })

  it('should not call anything if no console', () => {
    support.get_support.returns({console: false})
    createLogger()(store)(next)(action)
    assert.equal(transformer.transformer.callCount, 0)
  })

  it('should throw for invalid levels', () => {
    assert.throws(() => createLogger({logger: {}, level: 'invalid'}), /invalid level: invalid/)
  })

  it('should not call transformer when predicate returns false', () => {
    next.returns('value')
    assert.equal(createLogger({predicate: () => false})(store)(next)(action), 'value')
    assert.equal(transformer.transformer.callCount, 0)
  })

  it('should call transformer with appropriate opts', () => {
    store.getState.onCall(0).returns({type: 'before'})
    store.getState.onCall(1).returns({type: 'after'})
    next.returns('value')
    const logger = {log: {}}

    assert.equal(createLogger({logger})(store)(next)(action), 'value')

    assert.equal(diff.diff.callCount, 0)
    assert.equal(transformer.transformer.callCount, 1)
    assert.equal(transformer.transformer.args[0].length, 4)
    assert.deepEqual(transformer.transformer.args[0][0], logger)
    assert.deepEqual(transformer.transformer.args[0][1], {
      action: {type: 'ACTION!'},
      before: {type: 'before'},
      after: {type: 'after'},
      error: null,
      now: 0,
      took: 0
    })
    // not asserting support or options
  })

  it('should perform a diff & append to logger', () => {

    store.getState.onCall(0).returns({type: 'before'})
    store.getState.onCall(1).returns({type: 'after'})
    next.returns('value')
    diff.diff.returns('a magical diff')
    const logger = {log: {}}

    assert.equal(createLogger({logger, diff: true})(store)(next)(action), 'value')

    assert.equal(diff.diff.callCount, 1)
    assert.deepEqual(diff.diff.firstCall.args, [{type: 'before'}, {type: 'after'}])
    assert.equal(transformer.transformer.callCount, 1)
    assert.equal(transformer.transformer.args[0].length, 4)
    assert.deepEqual(transformer.transformer.args[0][0], logger)
    assert.deepEqual(transformer.transformer.args[0][1], {
      action: {type: 'ACTION!'},
      before: {type: 'before'},
      after: {type: 'after'},
      error: null,
      diff: 'a magical diff',
      now: 0,
      took: 0
    })
    // not asserting support or options
  })

  it('should catch errors, append to logger & rethrow', () => {
    store.getState.onCall(0).returns({type: 'before'})
    store.getState.onCall(1).returns({type: 'before'})
    next.throws(new Error('aw snap!'))

    const logger = {log: {}}

    assert.throws(() => createLogger({logger})(store)(next)(action), /aw snap!/)
    assert.equal(transformer.transformer.callCount, 1)
    assert.equal(transformer.transformer.args[0].length, 4)
    assert.deepEqual(transformer.transformer.args[0][0], logger)
    assert.deepEqual(transformer.transformer.args[0][1], {
      action: {type: 'ACTION!'},
      before: {type: 'before'},
      after: {type: 'before'},
      error: new Error('aw snap!'),
      now: 0,
      took: 0
    })
    // not asserting support or options
  })

})
