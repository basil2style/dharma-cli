'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = undefined;

var _ReactInstanceHandles = require('react/lib/ReactInstanceHandles');

var _ReactInstanceHandles2 = _interopRequireDefault(_ReactInstanceHandles);

var _ReactElement = require('react/lib/ReactElement');

var _ReactElement2 = _interopRequireDefault(_ReactElement);

var _ReactUpdates = require('react/lib/ReactUpdates');

var _ReactUpdates2 = _interopRequireDefault(_ReactUpdates);

var _ReactBlessedIDOperations = require('./ReactBlessedIDOperations');

var _ReactBlessedIDOperations2 = _interopRequireDefault(_ReactBlessedIDOperations);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _instantiateReactComponent = require('react/lib/instantiateReactComponent');

var _instantiateReactComponent2 = _interopRequireDefault(_instantiateReactComponent);

var _ReactBlessedInjection = require('./ReactBlessedInjection');

var _ReactBlessedInjection2 = _interopRequireDefault(_ReactBlessedInjection);

var _blessed = require('blessed');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Injecting dependencies.
 */
/**
 * React Blessed
 * ==============
 *
 * Exposing the renderer's API.
 */
(0, _ReactBlessedInjection2.default)();

/**
 * Renders the given react element with blessed.
 *
 * @param  {ReactElement}   element   - Node to update.
 * @param  {BlessedScreen}  screen    - The screen used to render the app.
 * @return {ReactComponent}           - The rendered component instance.
 */
function render(element, screen) {

  // Is the given element valid?
  (0, _invariant2.default)(_ReactElement2.default.isValidElement(element), 'render(): You must pass a valid ReactElement.');

  // Is the given screen valid?
  (0, _invariant2.default)(screen instanceof _blessed.Screen, 'render(): You must pass a valid BlessedScreen.');

  // Creating a root id & creating the screen
  var id = _ReactInstanceHandles2.default.createReactRootID();

  // Mounting the app
  var component = (0, _instantiateReactComponent2.default)(element);

  // Injecting the screen
  _ReactBlessedIDOperations2.default.setScreen(screen);

  // The initial render is synchronous but any updates that happen during
  // rendering, in componentWillMount or componentDidMount, will be batched
  // according to the current batching strategy.
  _ReactUpdates2.default.batchedUpdates(function () {
    // Batched mount component
    var transaction = _ReactUpdates2.default.ReactReconcileTransaction.getPooled();
    transaction.perform(function () {
      component.mountComponent(id, transaction, {});
    });
    _ReactUpdates2.default.ReactReconcileTransaction.release(transaction);
  });

  // Returning the screen so the user can attach listeners etc.
  return component._instance;
}

exports.render = render;