import sinon from 'sinon'

let perf_hooks = null
let clock = null

// perf_hooks not available in < node 8.5
try {
  perf_hooks = require('perf_hooks')
} catch (_) { /* MODULE_NOT_FOUND */ }

before(() => {
  clock = sinon.useFakeTimers({now: 0, toFake: ['Date']})
  if (perf_hooks) {
    sinon.stub(perf_hooks.performance, 'now').returns(0)
  }
})

after(() => {
  clock.restore()
  if (perf_hooks) {
    perf_hooks.performance.now.restore()
  }
})
