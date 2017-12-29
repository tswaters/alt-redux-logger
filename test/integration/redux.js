import {createStore as _createStore, applyMiddleware} from 'redux'

const ADD_ITEM = 'ADD_ITEM'
const REMOVE_ITEM = 'REMOVE_ITEM'
const RESET = 'RESET'
const ERROR = 'ERROR'

export const error = err => ({type: ERROR, err})
export const addItem = name => ({type: ADD_ITEM, name})
export const removeItem = id => ({type: REMOVE_ITEM, id})
export const reset = () => ({type: RESET})

const initialState = {items: [], index: 0}

export const createStore = logger => _createStore(
  (state = initialState, action) => {
    switch (action.type) {
      case RESET:
        return initialState
      case ADD_ITEM:
        return {
          ...state,
          index: state.index + 1,
          items: [...state.items, {id: state.index, name: action.name}]
        }
      case REMOVE_ITEM:
        return {
          ...state,
          items: state.items.filter(i => i.id !== action.id)
        }
      case ERROR:
        throw action.err
      default:
        return state
    }
  },
  applyMiddleware(
    logger
  )
)
