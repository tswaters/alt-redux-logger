import {colors as _colors} from 'tiny-ansi-colors/es'

export const transformer = (logger, payload, support, options) => {

  const {color, level, styles, format_time} = options
  const {action, before, after, diff, error, now, took} = payload
  const {ansi, colors, group: _group, groupEnd: _groupEnd} = support

  const group = _group ? 'group' : level
  const groupEnd = _groupEnd ? 'groupEnd' : level

  const transform_style = style => [
    style.color && `color:${style.color}`,
    style.dim && 'font-weight:lighter',
    style.bold && 'font-weight:bold'
  ].filter(c => !!c).join(';')

  const log_style = (a, b) =>
    (Array.isArray(a) && Array.isArray(a[0]) ? a : [[a, b]])
      .reduce((memo, [value, style]) => (
        !color || !colors
          ? [...memo, value]
          : ansi
            ? [...memo, _colors(value, style)]
            :  [`${memo[0]} %c${value}`, ...memo.slice(1), transform_style(style)]
      ), color && colors && !ansi ? [''] : [])

  logger[group](...log_style([
    ['action', styles.title],
    [action.type, styles.title_action],
    [`@ ${format_time(now)} (in ${took} ms)`, styles.title]
  ]))
  logger[level](...log_style('prev state', styles.prev), before)
  logger[level](...log_style('action    ', styles.action), action)
  if (error) {
    logger[level](...log_style('error     ', styles.error), error)
  }
  logger[level](...log_style('next state', styles.next), after)
  if (diff) {
    logger[group](...log_style('diff      ', styles.diff))
    if (diff.length === 0) {
      logger[level]('-- no diff --')
    } else {
      diff.forEach(item => logger[level](
        ...log_style(item.kind, styles[`diff_${item.kind}`]),
        `${item.path}:`, item.left, '→', item.right
      ))
    }
    logger[groupEnd]('--end diff--')
  }
  logger[groupEnd]('--log end--')
}
