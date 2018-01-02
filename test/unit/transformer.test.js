
import assert from 'assert'
import sinon from 'sinon'
import * as colors from 'tiny-ansi-colors'
import {get_defaults} from '../../src/defaults'
import {transformer} from '../../src/transformer'

// general note
// can't set TZ=UTC in windows, and I'm not to keen on updating local timezone to UTC
// get around this in linux CI by setting TZ=Canada/Pacific - that will output '1969-12-31 16:00:00'

describe('default transformer', () => {

  const options = get_defaults()
  const logger = {
    log: sinon.stub(),
    group: sinon.stub(),
    groupEnd: sinon.stub()
  }
  let payload = null
  let support = null

  before(() => {
    sinon.stub(colors, 'colors').returnsArg(0)
  })

  beforeEach(() => {
    support = {}
    payload = {
      action: {type: 'ACTION!'},
      before: {type: 'before'},
      after: {type: 'after'},
      now: 0,
      took: 0
    }
  })

  afterEach(() => {
    logger.log.reset()
    logger.group.reset()
    logger.groupEnd.reset()
  })

  after(() => {
    colors.colors.restore()
  })

  it('should function properly - no colors', () => {
    support.colors = false
    support.group = true
    support.groupEnd = true

    transformer(logger, payload, support, options)

    assert.equal(logger.log.callCount, 3)
    assert.equal(logger.group.callCount, 1)
    assert.equal(logger.groupEnd.callCount, 1)

    assert.deepEqual(logger.group.args[0], ['action', 'ACTION!', '@ 1969-12-31 16:00:00 (in 0 ms)'])
    assert.deepEqual(logger.log.args[0], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], ['next state', {type: 'after'}])
    assert.deepEqual(logger.groupEnd.args[0], ['--log end--'])
  })

  it('should function properly - ansi with colors', () => {
    support.colors = true
    support.group = true
    support.groupEnd = true
    support.ansi = true

    transformer(logger, payload, support, options)

    assert.equal(logger.log.callCount, 3)
    assert.equal(logger.group.callCount, 1)
    assert.equal(logger.groupEnd.callCount, 1)

    assert.deepEqual(logger.group.args[0], ['action', 'ACTION!', '@ 1969-12-31 16:00:00 (in 0 ms)'])
    assert.deepEqual(logger.log.args[0], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], ['next state', {type: 'after'}])
    assert.deepEqual(logger.groupEnd.args[0], ['--log end--'])
  })

  it('should function properly - no ansi with colors', () => {
    support.colors = true
    support.group = true
    support.groupEnd = true
    support.ansi = false

    transformer(logger, payload, support, options)

    assert.equal(logger.log.callCount, 3)
    assert.equal(logger.group.callCount, 1)
    assert.equal(logger.groupEnd.callCount, 1)

    assert.deepEqual(logger.group.args[0], [
      ' %caction %cACTION! %c@ 1969-12-31 16:00:00 (in 0 ms)',
      'color:#666;font-weight:lighter',
      'color:#fff;font-weight:bold',
      'color:#666;font-weight:lighter'
    ])
    assert.deepEqual(logger.log.args[0], [' %cprev state', 'color:#9E9E9E;font-weight:bold', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], [' %caction    ', 'color:#03A9F4;font-weight:bold', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], [' %cnext state', 'color:#4CAF50', {type: 'after'}])
    assert.deepEqual(logger.groupEnd.args[0], ['--log end--'])
  })

  it('should fall back on log if group not available', () => {
    support.colors = false
    support.group = false
    support.groupEnd = false

    transformer(logger, payload, support, options)

    assert.equal(logger.log.callCount, 5)
    assert.equal(logger.group.callCount, 0)
    assert.equal(logger.groupEnd.callCount, 0)

    assert.deepEqual(logger.log.args[0], ['action', 'ACTION!', '@ 1969-12-31 16:00:00 (in 0 ms)'])
    assert.deepEqual(logger.log.args[1], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[2], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[3], ['next state', {type: 'after'}])
    assert.deepEqual(logger.log.args[4], ['--log end--'])
  })

  it('should include an error when available', () => {
    support.colors = true
    support.group = true
    support.groupEnd = true
    support.ansi = true
    payload.error = {type: 'error'}

    transformer(logger, payload, support, options)

    assert.equal(logger.log.callCount, 4)
    assert.equal(logger.group.callCount, 1)
    assert.equal(logger.groupEnd.callCount, 1)

    assert.deepEqual(logger.group.args[0], ['action', 'ACTION!', '@ 1969-12-31 16:00:00 (in 0 ms)'])
    assert.deepEqual(logger.log.args[0], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], ['error     ', {type: 'error'}])
    assert.deepEqual(logger.log.args[3], ['next state', {type: 'after'}])
    assert.deepEqual(logger.groupEnd.args[0], ['--log end--'])
  })

  it('should handle blank diff array', () => {
    support.colors = true
    support.group = true
    support.groupEnd = true
    support.ansi = true
    payload.diff = []

    transformer(logger, payload, support, options)

    assert.equal(logger.log.callCount, 4)
    assert.equal(logger.group.callCount, 2)
    assert.equal(logger.groupEnd.callCount, 2)

    assert.deepEqual(logger.group.args[0], ['action', 'ACTION!', '@ 1969-12-31 16:00:00 (in 0 ms)'])
    assert.deepEqual(logger.group.args[1], ['diff      '])
    assert.deepEqual(logger.log.args[0], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], ['next state', {type: 'after'}])
    assert.deepEqual(logger.log.args[3], ['-- no diff --'])
    assert.deepEqual(logger.groupEnd.args[0], ['--end diff--'])
    assert.deepEqual(logger.groupEnd.args[1], ['--log end--'])
  })

  it('should handle diffs', () => {
    support.colors = true
    support.group = true
    support.groupEnd = true
    support.ansi = true
    payload.diff = [
      {kind: 'remove', path: 'a', left: 'a', right: null},
      {kind: 'add', path: 'b', left: null, right: 'b'},
      {kind: 'update', path: 'c', left: 'c', right: 'd'}
    ]

    transformer(logger, payload, support, options)

    assert.equal(logger.log.callCount, 6)
    assert.equal(logger.group.callCount, 2)
    assert.equal(logger.groupEnd.callCount, 2)

    assert.deepEqual(logger.group.args[0], ['action', 'ACTION!', '@ 1969-12-31 16:00:00 (in 0 ms)'])
    assert.deepEqual(logger.group.args[1], ['diff      '])
    assert.deepEqual(logger.log.args[0], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], ['next state', {type: 'after'}])
    assert.deepEqual(logger.log.args[3], ['remove', 'a:', 'a', '→', null])
    assert.deepEqual(logger.log.args[4], ['add', 'b:', null, '→', 'b'])
    assert.deepEqual(logger.log.args[5], ['update', 'c:', 'c', '→', 'd'])
    assert.deepEqual(logger.groupEnd.args[0], ['--end diff--'])
    assert.deepEqual(logger.groupEnd.args[1], ['--log end--'])
  })

})
