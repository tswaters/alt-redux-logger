
import assert from 'assert'
import sinon from 'sinon'
import * as colors from 'tiny-ansi-colors'
import {get_defaults} from '../../src/defaults'
import {create_printer} from '../../src/printer'

// general note
// can't set TZ=UTC in windows, and I'm not to keen on updating local timezone to UTC
// get around this in linux CI by setting TZ=Canada/Pacific - that will output '1969-12-31 16:00:00'

describe('default printer', () => {

  const options = {
    ...get_defaults(),
    format_time: now => new Date(now).toJSON()
  }

  const logger = {
    log: sinon.stub(),
    group: sinon.stub(),
    groupEnd: sinon.stub()
  }

  let action = null
  let beforeState = null
  let afterState = null
  let error = null
  let diff = null
  let now = null
  let took = null
  let support = null

  before(() => {
    sinon.stub(colors, 'colors').returnsArg(0)
  })

  beforeEach(() => {
    support = {
      colors: false,
      groupColors: true,
      group: true,
      groupEnd: true
    }
    action = {type: 'ACTION!'}
    beforeState = {type: 'before'}
    afterState = {type: 'after'}
    error = null
    diff = null
    now = 0
    took = 0
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

    const printer = create_printer(support, options)
    printer.start(logger, action, now)
    printer.before(logger, beforeState)
    printer.action(logger, action)
    printer.after(logger, afterState)
    printer.end(logger, took)

    assert.equal(logger.log.callCount, 4)
    assert.equal(logger.group.callCount, 1)
    assert.equal(logger.groupEnd.callCount, 1)

    assert.deepEqual(logger.group.args[0], ['action', 'ACTION!', '@ 1970-01-01T00:00:00.000Z'])
    assert.deepEqual(logger.log.args[0], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], ['next state', {type: 'after'}])
    assert.deepEqual(logger.log.args[3], ['(took 0 ms)'])
    assert.deepEqual(logger.groupEnd.args[0], ['--log end--'])
  })

  it('should function properly - ansi with colors', () => {
    support.colors = true
    support.ansi = true

    const printer = create_printer(support, options)
    printer.start(logger, action, now)
    printer.before(logger, beforeState)
    printer.action(logger, action)
    printer.after(logger, afterState)
    printer.end(logger, took)

    assert.equal(logger.log.callCount, 4)
    assert.equal(logger.group.callCount, 1)
    assert.equal(logger.groupEnd.callCount, 1)

    assert.deepEqual(logger.group.args[0], ['action', 'ACTION!', '@ 1970-01-01T00:00:00.000Z'])
    assert.deepEqual(logger.log.args[0], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], ['next state', {type: 'after'}])
    assert.deepEqual(logger.log.args[3], ['(took 0 ms)'])
    assert.deepEqual(logger.groupEnd.args[0], ['--log end--'])
  })

  it('should function properly - no ansi with colors', () => {
    support.colors = true
    support.ansi = false

    const printer = create_printer(support, options)
    printer.start(logger, action, now)
    printer.before(logger, beforeState)
    printer.action(logger, action)
    printer.after(logger, afterState)
    printer.end(logger, took)

    assert.equal(logger.log.callCount, 4)
    assert.equal(logger.group.callCount, 1)
    assert.equal(logger.groupEnd.callCount, 1)

    assert.deepEqual(logger.group.args[0], [
      ' %caction %cACTION! %c@ 1970-01-01T00:00:00.000Z',
      'color:#666;font-weight:lighter',
      'color:#000;font-weight:bold',
      'color:#666;font-weight:lighter'
    ])
    assert.deepEqual(logger.log.args[0], [' %cprev state', 'color:#9E9E9E;font-weight:bold', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], [' %caction    ', 'color:#03A9F4;font-weight:bold', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], [' %cnext state', 'color:#4CAF50', {type: 'after'}])
    assert.deepEqual(logger.log.args[3], [' %c(took 0 ms)', 'color:#666;font-weight:lighter'])
    assert.deepEqual(logger.groupEnd.args[0], ['--log end--'])
  })

  it('should fall back on log if group not available', () => {
    support.group = false
    support.groupEnd = false

    const printer = create_printer(support, options)
    printer.start(logger, action, now)
    printer.before(logger, beforeState)
    printer.action(logger, action)
    printer.after(logger, afterState)
    printer.end(logger, took)

    assert.equal(logger.log.callCount, 6)
    assert.equal(logger.group.callCount, 0)
    assert.equal(logger.groupEnd.callCount, 0)

    assert.deepEqual(logger.log.args[0], ['action', 'ACTION!', '@ 1970-01-01T00:00:00.000Z'])
    assert.deepEqual(logger.log.args[1], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[2], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[3], ['next state', {type: 'after'}])
    assert.deepEqual(logger.log.args[4], ['(took 0 ms)'])
    assert.deepEqual(logger.log.args[5], ['--log end--'])
  })

  it('should aggregate group into a single statement if no group color support (ie/edge)', () => {
    support.group = true
    support.groupEnd = true
    support.groupColors = false

    const printer = create_printer(support, options)
    printer.start(logger, action, now)
    printer.before(logger, beforeState)
    printer.action(logger, action)
    printer.after(logger, afterState)
    printer.end(logger, took)

    assert.equal(logger.log.callCount, 4)
    assert.equal(logger.group.callCount, 1)
    assert.equal(logger.groupEnd.callCount, 1)

    assert.deepEqual(logger.group.args[0], ['action ACTION! @ 1970-01-01T00:00:00.000Z'])
    assert.deepEqual(logger.log.args[0], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], ['next state', {type: 'after'}])
    assert.deepEqual(logger.log.args[3], ['(took 0 ms)'])
    assert.deepEqual(logger.groupEnd.args[0], ['--log end--'])
  })

  it('should include an error when available', () => {
    support.ansi = true
    error = {type: 'error'}

    const printer = create_printer(support, options)
    printer.start(logger, action, now)
    printer.before(logger, beforeState)
    printer.action(logger, action)
    printer.error(logger, error)
    printer.after(logger, afterState)
    printer.end(logger, took)

    assert.equal(logger.log.callCount, 5)
    assert.equal(logger.group.callCount, 1)
    assert.equal(logger.groupEnd.callCount, 1)

    assert.deepEqual(logger.group.args[0], ['action', 'ACTION!', '@ 1970-01-01T00:00:00.000Z'])
    assert.deepEqual(logger.log.args[0], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], ['error     ', {type: 'error'}])
    assert.deepEqual(logger.log.args[3], ['next state', {type: 'after'}])
    assert.deepEqual(logger.log.args[4], ['(took 0 ms)'])
    assert.deepEqual(logger.groupEnd.args[0], ['--log end--'])
  })

  it('should handle blank diff array', () => {
    support.ansi = true
    diff = []

    const printer = create_printer(support, options)
    printer.start(logger, action, now)
    printer.before(logger, beforeState)
    printer.action(logger, action)
    printer.after(logger, afterState)
    printer.diff(logger, diff)
    printer.end(logger, took)

    assert.equal(logger.log.callCount, 5)
    assert.equal(logger.group.callCount, 2)
    assert.equal(logger.groupEnd.callCount, 2)

    assert.deepEqual(logger.group.args[0], ['action', 'ACTION!', '@ 1970-01-01T00:00:00.000Z'])
    assert.deepEqual(logger.log.args[0], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], ['next state', {type: 'after'}])
    assert.deepEqual(logger.group.args[1], ['diff      '])
    assert.deepEqual(logger.log.args[3], ['-- no diff --'])
    assert.deepEqual(logger.groupEnd.args[0], ['--end diff--'])
    assert.deepEqual(logger.log.args[4], ['(took 0 ms)'])
    assert.deepEqual(logger.groupEnd.args[1], ['--log end--'])
  })

  it('should handle diffs', () => {
    support.ansi = true
    diff = [
      {kind: 'remove', path: 'a', left: 'a', right: null},
      {kind: 'add', path: 'b', left: null, right: 'b'},
      {kind: 'update', path: 'c', left: 'c', right: 'd'}
    ]

    const printer = create_printer(support, options)
    printer.start(logger, action, now)
    printer.before(logger, beforeState)
    printer.action(logger, action)
    printer.after(logger, afterState)
    printer.diff(logger, diff)
    printer.end(logger, took)

    assert.equal(logger.log.callCount, 7)
    assert.equal(logger.group.callCount, 2)
    assert.equal(logger.groupEnd.callCount, 2)

    assert.deepEqual(logger.group.args[0], ['action', 'ACTION!', '@ 1970-01-01T00:00:00.000Z'])
    assert.deepEqual(logger.log.args[0], ['prev state', {type: 'before'}])
    assert.deepEqual(logger.log.args[1], ['action    ', {type: 'ACTION!'}])
    assert.deepEqual(logger.log.args[2], ['next state', {type: 'after'}])
    assert.deepEqual(logger.group.args[1], ['diff      '])
    assert.deepEqual(logger.log.args[3], ['remove', 'a:', 'a', '→', null])
    assert.deepEqual(logger.log.args[4], ['add', 'b:', null, '→', 'b'])
    assert.deepEqual(logger.log.args[5], ['update', 'c:', 'c', '→', 'd'])
    assert.deepEqual(logger.groupEnd.args[0], ['--end diff--'])
    assert.deepEqual(logger.log.args[6], ['(took 0 ms)'])
    assert.deepEqual(logger.groupEnd.args[1], ['--log end--'])
  })

})
