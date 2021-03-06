
const isNode = typeof exports === 'object' && typeof module !== 'undefined'
const isEdge = !isNode && /\bEdge\b/.test(navigator.userAgent)

const browser = {
  isNode,
  isFirefox: !isNode && /firefox/i.test(navigator.userAgent),
  isEdge,
  isIE: !isNode && !!document.documentMode,
  isChrome: !isNode && !isEdge && !!window.chrome,
  isSafari: !isNode && !!window.safari,
}

export const get_now = () => {
  let performance = null
  if (isNode) {
    try {
      performance = require('perf_hooks').performance
    } catch (_) { /* MODULE_NOT_FOUND */ }
  } else if (window.performance) {
    performance = window.performance
  }
  return () => performance ? performance.now() : Date.now()
}

export const get_support = logger => {
  const hasConsole = typeof logger !== 'undefined'
  return {
    ansi: browser.isNode,
    console: hasConsole,
    group: hasConsole && !!logger.group,
    groupEnd: hasConsole && !!logger.groupEnd,
    colors: hasConsole && !(browser.isIE || browser.isEdge),
    groupColors: hasConsole && (isNode || browser.isChrome || browser.isSafari || browser.isFirefox),
  }
}
