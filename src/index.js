
import {get_defaults} from './defaults'
import {get_now as _get_now, get_support} from './support'
import {diff as get_diff} from '@tswaters/tiny-diff'

const get_now = _get_now()

export const createLogger = (options = {}) => {

  const defaults = get_defaults()
  const opts = {
    ...defaults,
    ...options,
    styles: {
      ...defaults.styles,
      ...options.styles
    }
  }

  const {
    logger,
    level,
    diff: use_diff,
    diffPredicate,
    predicate,
    create_printer,
    stateTransformer,
    actionTransformer,
    errorTransformer
  } = opts

  const support = get_support(opts.logger)

  if (!support.console) {
    return () => next => action => next(action)
  }

  if (!logger[level]) { throw new Error(`invalid level: ${level}`) }

  const printer = create_printer(support, opts)

  return store => next => action => {

    if (!predicate(store.getState, action)) {
      return next(action)
    }

    const now = Date.now()
    const before = stateTransformer(store.getState())

    if (typeof printer.start === 'function') {
      printer.start(logger, action, now)
    }

    if (typeof printer.before === 'function') {
      printer.before(logger, before)
    }

    if (typeof printer.action === 'function') {
      printer.action(logger, actionTransformer(action))
    }

    const start = get_now()

    let error = null
    let returnValue = null

    try {
      returnValue = next(action)
    } catch (err) {
      error = errorTransformer(err)
    }

    const took = get_now() - start
    const after = stateTransformer(store.getState())

    if (typeof printer.after === 'function') {
      printer.after(logger, after)
    }

    if (error && typeof printer.error === 'function') {
      printer.error(logger, error)
    }

    let diff = null
    if (use_diff && diffPredicate(store.getState, action)) {
      diff = get_diff(before, after)
    }

    if (diff && typeof printer.diff === 'function') {
      printer.diff(logger, diff)
    }

    if (typeof printer.end === 'function') {
      printer.end(logger, took)
    }

    if (typeof printer === 'function') {
      printer(logger, {
        action: actionTransformer(action),
        before,
        after,
        error,
        diff,
        now,
        took
      }, support, opts)
    }

    if (error) { throw error }
    return returnValue
  }
}
