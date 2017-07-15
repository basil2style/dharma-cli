'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = inject;

var _ReactInjection = require('react/lib/ReactInjection');

var _ReactInjection2 = _interopRequireDefault(_ReactInjection);

var _ReactComponentEnvironment = require('react/lib/ReactComponentEnvironment');

var _ReactComponentEnvironment2 = _interopRequireDefault(_ReactComponentEnvironment);

var _ReactBlessedReconcileTransaction = require('./ReactBlessedReconcileTransaction');

var _ReactBlessedReconcileTransaction2 = _interopRequireDefault(_ReactBlessedReconcileTransaction);

var _ReactBlessedComponent = require('./ReactBlessedComponent');

var _ReactBlessedComponent2 = _interopRequireDefault(_ReactBlessedComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * React Blessed Dependency Injection
 * ===================================
 *
 * Injecting the renderer's needed dependencies into React's internals.
 */
function inject() {

  _ReactInjection2.default.NativeComponent.injectGenericComponentClass(_ReactBlessedComponent2.default);

  _ReactInjection2.default.Updates.injectReconcileTransaction(_ReactBlessedReconcileTransaction2.default);

  _ReactInjection2.default.EmptyComponent.injectEmptyComponent('element');

  // NOTE: we're monkeypatching ReactComponentEnvironment because
  // ReactInjection.Component.injectEnvironment() currently throws,
  // as it's already injected by ReactDOM for backward compat in 0.14 betas.
  // Read more: https://github.com/Yomguithereal/react-blessed/issues/5
  _ReactComponentEnvironment2.default.processChildrenUpdates = function () {};
  _ReactComponentEnvironment2.default.replaceNodeWithMarkupByID = function () {};
}