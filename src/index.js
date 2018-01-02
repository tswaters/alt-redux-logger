
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

  const {logger, level, diff, predicate, transformer} = opts
  const support = get_support(opts.logger)

  if (!support.console) {
    return () => next => action => next(action)
  }

  if (!logger[level]) { throw new Error(`invalid level: ${level}`) }

  return store => next => action => {

    const now = Date.now()
    const before = store.getState()

    let error = null
    let returnValue = null

    try {
      returnValue = next(action)
    } catch (err) {
      error = err
    }

    const took = Date.now() - now
    const after = store.getState()

    const payload = {action, before, after, error, now, took}

    if (diff) { payload.diff = get_diff(before, after) }

    if (predicate(payload)) {
      transformer(logger, payload, support, opts)
    }

    if (error) { throw error }
    return returnValue
  }
}
