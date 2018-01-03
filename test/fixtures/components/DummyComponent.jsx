
import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import logger from '../logger'

class DummyComponent extends PureComponent {
  static propTypes = {
    items: PropTypes.array.isRequired
  }
  componentWillReceiveProps (nextProps) {
    logger.log('componentWillReceiveProps', nextProps.items)
  }
  render () {
    return (
      <div />
    )
  }
}

const mapStateToProps = state => ({items: state.items})

export default connect(mapStateToProps)(DummyComponent)
