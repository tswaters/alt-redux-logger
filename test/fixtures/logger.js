/* eslint-disable no-console */

import sinon from 'sinon'

const logger = {
  log: sinon.stub(),
  group: sinon.stub(),
  groupEnd: sinon.stub()
}

export const reset = () => {
  logger.log.reset()
  logger.group.reset()
  logger.groupEnd.reset()
}

export default logger
