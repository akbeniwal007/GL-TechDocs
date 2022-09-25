/* eslint-disable
    camelcase,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let DispatchManager
const Settings = require('@overleaf/settings')
const logger = require('@overleaf/logger')
const Keys = require('./UpdateKeys')
const redis = require('@overleaf/redis-wrapper')
const Errors = require('./Errors')
const _ = require('lodash')

const UpdateManager = require('./UpdateManager')
const Metrics = require('./Metrics')
const RateLimitManager = require('./RateLimitManager')

module.exports = DispatchManager = {
  createDispatcher(RateLimiter, queueShardNumber) {
    let pendingListKey
    if (queueShardNumber === 0) {
      pendingListKey = 'pending-updates-list'
    } else {
      pendingListKey = `pending-updates-list-${queueShardNumber}`
    }

    const client = redis.createClient(Settings.redis.documentupdater)
    const worker = {
      client,
      _waitForUpdateThenDispatchWorker(callback) {
        if (callback == null) {
          callback = function () {}
        }
        const timer = new Metrics.Timer('worker.waiting')
        return worker.client.blpop(pendingListKey, 0, function (error, result) {
          logger.debug(`getting ${queueShardNumber}`, error, result)
          timer.done()
          if (error != null) {
            return callback(error)
          }
          if (result == null) {
            return callback()
          }
          const [list_name, doc_key] = Array.from(result)
          const [project_id, doc_id] = Array.from(
            Keys.splitProjectIdAndDocId(doc_key)
          )
          // Dispatch this in the background
          const backgroundTask = cb =>
            UpdateManager.processOutstandingUpdatesWithLock(
              project_id,
              doc_id,
              function (error) {
                // log everything except OpRangeNotAvailable errors, these are normal
                if (error != null) {
                  // downgrade OpRangeNotAvailable and "Delete component" errors so they are not sent to sentry
                  const logAsDebug =
                    error instanceof Errors.OpRangeNotAvailableError ||
                    error instanceof Errors.DeleteMismatchError
                  if (logAsDebug) {
                    logger.debug(
                      { err: error, project_id, doc_id },
                      'error processing update'
                    )
                  } else {
                    logger.error(
                      { err: error, project_id, doc_id },
                      'error processing update'
                    )
                  }
                }
                return cb()
              }
            )
          return RateLimiter.run(backgroundTask, callback)
        })
      },

      run() {
        if (Settings.shuttingDown) {
          return
        }
        return worker._waitForUpdateThenDispatchWorker(error => {
          if (error != null) {
            logger.error({ err: error }, 'Error in worker process')
            throw error
          } else {
            return worker.run()
          }
        })
      },
    }

    return worker
  },

  createAndStartDispatchers(number) {
    const RateLimiter = new RateLimitManager(number)
    _.times(number, function (shardNumber) {
      return DispatchManager.createDispatcher(RateLimiter, shardNumber).run()
    })
  },
}
