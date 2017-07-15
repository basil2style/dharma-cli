'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CallbackQueue = require('react/lib/CallbackQueue');

var _CallbackQueue2 = _interopRequireDefault(_CallbackQueue);

var _PooledClass = require('react/lib/PooledClass');

var _PooledClass2 = _interopRequireDefault(_PooledClass);

var _Transaction = require('react/lib/Transaction');

var _Transaction2 = _interopRequireDefault(_Transaction);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * React Blessed Specific React Transaction
 * =========================================
 *
 * React custom reconcile transaction injected by the renderer to enable
 * updates.
 *
 * NOTE: This looks more like a shim than the proper thing actually.
 */
var ON_BLESSED_READY_QUEUEING = {
  initialize: function initialize() {
    this.reactMountReady.reset();
  },
  close: function close() {
    this.reactMountReady.notifyAll();
  }
};

function ReactBlessedReconcileTransaction() {
  this.reinitializeTransaction();
  this.reactMountReady = _CallbackQueue2.default.getPooled(null);
}

var Mixin = {
  getTransactionWrappers: function getTransactionWrappers() {
    return [ON_BLESSED_READY_QUEUEING];
  },
  getReactMountReady: function getReactMountReady() {
    return this.reactMountReady;
  },
  destructor: function destructor() {
    _CallbackQueue2.default.release(this.reactMountReady);
    this.reactMountReady = null;
  }
};

(0, _lodash.extend)(ReactBlessedReconcileTransaction.prototype, _Transaction2.default.Mixin, Mixin);

_PooledClass2.default.addPoolingTo(ReactBlessedReconcileTransaction);

exports.default = ReactBlessedReconcileTransaction;