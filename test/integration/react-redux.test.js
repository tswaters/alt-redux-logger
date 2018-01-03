
import sinon from 'sinon'
import assert from 'assert'
import React from 'react'
import {Provider} from 'react-redux'
import {mount} from 'enzyme'

import {createLogger} from '../../src'
import {addItem, createStore} from '../fixtures/redux'
import DummyComponent from '../fixtures/components/DummyComponent'
import logger, {reset as logger_reset} from '../fixtures/logger'

describe('react-redux', () => {

  let store = null
  let clock = null

  beforeEach(() => {
    clock = sinon.useFakeTimers({now: 0, toFake: ['Date']})
    store = createStore(
      createLogger({logger, color: false, format_time: now => new Date(now).toJSON()})
    )
  })

  afterEach(() => {
    logger_reset()
  })

  after(() => {
    clock.restore()
  })

  it('should log component logging in the correct order', () => {

    mount(<Provider store={store}><DummyComponent /></Provider>)
    store.dispatch(addItem('test!'))

    assert.equal(logger.group.callCount, 1)
    assert.equal(logger.log.callCount, 5)
    assert.equal(logger.groupEnd.callCount, 1)
    assert.deepEqual(logger.group.args[0], ['action', 'ADD_ITEM', '@ 1970-01-01T00:00:00.000Z'])
    assert.deepEqual(logger.log.args[0], ['prev state', {items: [], index: 0}])
    assert.deepEqual(logger.log.args[1], ['action    ', {type: 'ADD_ITEM', name: 'test!'}])
    assert.deepEqual(logger.log.args[2], ['componentWillReceiveProps', [{id: 0, name: 'test!'}]])
    assert.deepEqual(logger.log.args[3], ['next state', {items: [{id: 0, name: 'test!'}], index: 1}])
    assert.deepEqual(logger.log.args[4], ['(took 0 ms)'])
    assert.deepEqual(logger.groupEnd.args[0], ['--log end--'])
  })

})
