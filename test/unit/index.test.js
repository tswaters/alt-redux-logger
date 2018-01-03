
import assert from 'assert'
import sinon from 'sinon'

import {createLogger} from '../../src'
import * as diff from '@tswaters/tiny-diff'
import * as support from '../../src/support'
import * as printer from '../../src/printer'
import logger, {reset as logger_reset} from '../fixtures/logger'

describe('createLogger', () => {

  const printStub = sinon.stub()
  const store = {getState: sinon.stub()}
  const action = {type: 'ACTION!'}
  const next = sinon.stub()

  before(() => {
    sinon.stub(diff, 'diff')
    sinon.stub(printer, 'create_printer')
    sinon.stub(support, 'get_support')
  })

  beforeEach(() => {
    printer.create_printer.returns(printStub)
    support.get_support.returns({console: true, groupColors: true})
  })

  afterEach(() => {
    logger_reset()
    printStub.reset()
    store.getState.reset()
    support.get_support.reset()
    printer.create_printer.reset()
  })

  after(() => {
    diff.diff.restore()
    printer.create_printer.restore()
    support.get_support.restore()
  })

  it('should not call anything if no console', () => {
    support.get_support.returns({console: false})
    createLogger()(store)(next)(action)
    assert.equal(printStub.callCount, 0)
  })

  it('should throw for invalid levels', () => {
    assert.throws(() => createLogger({logger: {}, level: 'invalid'}), /invalid level: invalid/)
  })

  it('should not call printer when predicate returns false', () => {
    next.returns('value')
    assert.equal(createLogger({predicate: () => false})(store)(next)(action), 'value')
    assert.equal(printStub.callCount, 0)
  })

  it('should call printer with appropriate opts', () => {
    store.getState.onCall(0).returns({type: 'before'})
    store.getState.onCall(1).returns({type: 'after'})
    next.returns('value')
    assert.equal(createLogger({logger})(store)(next)(action), 'value')

    assert.equal(diff.diff.callCount, 0)
    assert.equal(printStub.callCount, 1)
    assert.equal(printStub.args[0].length, 4)
    assert.deepEqual(printStub.args[0][0], logger)
    assert.deepEqual(printStub.args[0][1], {
      action: {type: 'ACTION!'},
      before: {type: 'before'},
      after: {type: 'after'},
      diff: null,
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

    assert.equal(createLogger({logger, diff: true})(store)(next)(action), 'value')

    assert.equal(diff.diff.callCount, 1)
    assert.deepEqual(diff.diff.firstCall.args, [{type: 'before'}, {type: 'after'}])
    assert.equal(printStub.callCount, 1)
    assert.equal(printStub.args[0].length, 4)
    assert.deepEqual(printStub.args[0][0], logger)
    assert.deepEqual(printStub.args[0][1], {
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
    assert.throws(() => createLogger({logger})(store)(next)(action), /aw snap!/)
    assert.equal(printStub.callCount, 1)
    assert.equal(printStub.args[0].length, 4)
    assert.deepEqual(printStub.args[0][0], logger)
    assert.deepEqual(printStub.args[0][1], {
      action: {type: 'ACTION!'},
      before: {type: 'before'},
      after: {type: 'before'},
      diff: null,
      error: new Error('aw snap!'),
      now: 0,
      took: 0
    })
    // not asserting support or options
  })

})
