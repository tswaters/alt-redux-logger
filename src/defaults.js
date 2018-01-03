
import {create_printer} from './printer'

export const get_defaults = () => ({

  logger: console,

  color: true,

  diff: false,

  level: 'log',

  styles: {
    title: {color: '#666', dim: true},
    title_action: {bold: true},
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

  diffPredicate: () => true,

  stateTransformer: state => state,
  actionTransformer: action => action,
  errorTransformer: error => error,

  create_printer

})
