
import {colors as _colors} from 'tiny-ansi-colors/es'

export default {

  logger: console,

  color: true,

  diff: false,

  level: 'log',

  styles: {
    title: {color: '#666', dim: true},
    title_action: {color: '#fff', bold: true},
    prev: {color: '#9E9E9E', bold: true},
    action: {color: '#03A9F4', bold: true},
    error: {color: '#F20404', bold: true},
    next: {color: '#4CAF50'},
    diff: {bold: true},
    diff_add: {color: '#4CAF50'},
    diff_remove: {color: '#F44336'},
    diff_update: {color: '#2196F3'}
  },

  format_time: now => new Date(now).toLocaleString(),

  predicate: () => true,

  transformer: (logger, payload, support, options) => {

    const {level} = options
    const {action, before, after, diff, error, now, took} = payload

    const group = support.group ? 'group' : level
    const groupEnd = support.groupEnd ? 'groupEnd' : level

    const transform_style = style => [
      style.color && `color: ${style.color}`,
      style.dim && 'font-weight: lighter',
      style.bold && 'font-weight: bold'
    ].filter(c => !!c).join(';')

    const log_style = (a, b) =>
      (Array.isArray(a) && Array.isArray(a[0]) ? a : [[a, b]])
        .reduce((memo, [value, style]) => (
          !options.color
            ? [...memo, value]
            : support.ansi
              ? [...memo, _colors(value, style)]
              :  [`${memo[0]} %c${value}`, ...memo.slice(1), transform_style(style)]
        ), options.color && !support.ansi ? [''] : [])

    logger[group](...log_style([
      ['action', options.styles.title],
      [action.type, options.styles.title_action],
      [`@ ${options.format_time(now)} (in ${took} ms)`, options.styles.title]
    ]))
    logger[level](...log_style('prev state', options.styles.prev), before)
    logger[level](...log_style('action    ', options.styles.action), action)
    if (error) {
      logger[level](...log_style('error     ', options.styles.error), error)
    }
    logger[level](...log_style('next state', options.styles.next), after)
    if (diff) {
      logger[group](...log_style('diff      ', options.styles.diff))
      if (diff.length === 0) {
        logger[level]('-- no diff --')
      } else {
        diff.forEach(item => logger[level](
          ...log_style(item.kind, options.styles[`diff_${item.kind}`]),
          `${item.path}:`, item.left, '→', item.right
        ))
      }
      logger[groupEnd]('--end diff--')
    }
    logger[groupEnd]('--log end--')
  },


}
