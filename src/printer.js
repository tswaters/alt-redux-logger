import {colors as _colors} from 'tiny-ansi-colors'

export const printer = (logger, payload, support, options) => {

  const {color: use_color, level, styles, format_time} = options
  const {action, before, after, diff, error, now, took} = payload
  const {ansi, colors: has_color, group, groupEnd, groupColors} = support

  const transform_style = style => [
    style.color && `color:${style.color}`,
    style.dim && 'font-weight:lighter',
    style.bold && 'font-weight:bold'
  ].filter(c => !!c).join(';')

  const log_style = (a, b, force_off = false) => {

    // support both simple (text, style) and complex ([[text, style], [text, style]])
    const complex = Array.isArray(a) && Array.isArray(a[0])
    const things = complex ? a : [[a, b]]

    // if complex style, b is the force parameter.
    force_off = complex ? b : force_off

    // this turns the [text, style] array into one of the following:
    // - browser: [`%c${first}%c{second}`, 'first-style', 'second-style', etc.]
    // - ansi: [escape, first, unescape, escape, second, unescape, etc.]
    // - color off by support/option or force: true, [first, second, etc.]

    return things.reduce((memo, [value, color]) => (
      force_off || !use_color || !has_color
        ? [...memo, value]
        : ansi
          ? [...memo, _colors(value, color)]
          :  [`${memo[0]} %c${value}`, ...memo.slice(1), transform_style(color)]
    ), use_color && has_color && !ansi ? [''] : [])
  }

  const log = (...use) => {
    return (...extra) => logger[level](...log_style(...use), ...extra)
  }

  const log_group = (...use) => {
    const force = !groupColors
    const method = group ? 'group' : level
    const things = log_style(...use, force)
    logger[method](...force ? [things.join(' ')] : things)
  }

  const log_group_end = extra => {
    const method = groupEnd ? 'groupEnd' : level
    logger[method](extra)
  }

  log_group([
    ['action', styles.title],
    [action.type, styles.title_action],
    [`@ ${format_time(now)} (in ${took} ms)`, styles.title]
  ])
  log('prev state', styles.prev)(before)
  log('action    ', styles.action)(action)
  if (error) {
    log('error     ', styles.error)(error)
  }
  log('next state', styles.next)(after)
  if (diff) {
    log_group('diff      ', styles.diff)
    if (diff.length === 0) {
      logger[level]('-- no diff --')
    } else {
      diff.forEach(item => log(item.kind, styles[`diff_${item.kind}`])(
        `${item.path}:`, item.left, '→', item.right,
      ))
    }
    log_group_end('--end diff--')
  }
  log_group_end('--log end--')
}
