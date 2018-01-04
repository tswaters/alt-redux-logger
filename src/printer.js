import {colors as _colors} from 'tiny-ansi-colors'

export const createPrinter = (support, options) => {

  const {color: use_color, level, styles, formatTime} = options
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

  const log = logger => (...use) => {
    return (...extra) => logger[level](...log_style(...use), ...extra)
  }

  const log_group = logger => (...use) => {
    const force = !groupColors
    const method = group ? 'group' : level
    const things = log_style(...use, force)
    logger[method](...force ? [things.join(' ')] : things)
  }

  const log_group_end = logger => extra => {
    const method = groupEnd ? 'groupEnd' : level
    logger[method](extra)
  }

  return {
    start (logger, now, ...actions) {
      log_group(logger)([
        ['action', styles.title],
        [actions[0].type, styles.titleAction],
        [`@ ${formatTime(now)}`, styles.title]
      ])
    },
    before (logger, before) {
      log(logger)('prev state', styles.prev)(before)
    },
    action (logger, ...actions) {
      log(logger)('action    ', styles.action)(...actions)
    },
    error (logger, error) {
      log(logger)('error     ', styles.error)(error)
    },
    after (logger, after) {
      log(logger)('next state', styles.next)(after)
    },
    diff (logger, diff) {
      log_group(logger)('diff      ', styles.diff)
      if (diff.length === 0) {
        logger[level]('--no diff--')
      } else {
        diff.forEach(item => log(logger)(item.kind, styles[`diff${item.kind.substr(0, 1).toUpperCase()}${item.kind.substring(1)}`])(
          `${item.path}:`, item.left, '→', item.right,
        ))
      }
      log_group_end(logger)('--end diff--')
    },
    end (logger, took) {
      log(logger)(`(took ${took} ms)`, styles.title)()
      log_group_end(logger)('--log end--')
    }
  }
}
