
import {createPrinter} from './printer'

export const get_defaults = () => ({

  logger: console,

  color: true,

  diff: false,

  level: 'log',

  styles: {
    title: {color: '#666', dim: true},
    titleAction: {bold: true},
    prev: {color: '#9E9E9E', bold: true},
    action: {color: '#03A9F4', bold: true},
    error: {color: '#F20404', bold: true},
    next: {color: '#4CAF50'},
    diff: {bold: true},
    diffAdd: {color: '#4CAF50'},
    diffRemove: {color: '#F44336'},
    diffUpdate: {color: '#2196F3'}
  },

  formatTime: now => new Date(now).toLocaleString(),

  predicate: () => true,

  diffPredicate: () => true,

  stateTransformer: state => state,
  actionTransformer: (...actions) => actions,
  errorTransformer: error => error,

  createPrinter

})
