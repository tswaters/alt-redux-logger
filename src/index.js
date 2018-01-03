
import {get_defaults} from './defaults'
import {get_support} from './support'
import {diff as get_diff} from '@tswaters/tiny-diff'

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
    diff,
    diffPredicate,
    predicate,
    printer,
    stateTransformer,
    actionTransformer,
    errorTransformer
  } = opts

  const support = get_support(opts.logger)

  if (!support.console) {
    return () => next => action => next(action)
  }

  if (!logger[level]) { throw new Error(`invalid level: ${level}`) }

  return store => next => action => {

    if (!predicate(store.getState, action)) {
      return next(action)
    }

    const now = Date.now()
    const before = stateTransformer(store.getState())

    let error = null
    let returnValue = null

    try {
      returnValue = next(action)
    } catch (err) {
      error = errorTransformer(err)
    }

    const took = Date.now() - now
    const after = stateTransformer(store.getState())

    const payload = {
      action: actionTransformer(action),
      before,
      after,
      error,
      now,
      took
    }

    if (diff && diffPredicate(store.getState, action)) {
      payload.diff = get_diff(before, after)
    }

    printer(logger, payload, support, opts)

    if (error) { throw error }
    return returnValue
  }
}
