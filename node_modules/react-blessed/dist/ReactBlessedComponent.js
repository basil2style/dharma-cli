'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * React Blessed Component
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * ========================
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * React component abstraction for the blessed library.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _ReactMultiChild = require('react/lib/ReactMultiChild');

var _ReactMultiChild2 = _interopRequireDefault(_ReactMultiChild);

var _ReactBlessedIDOperations = require('./ReactBlessedIDOperations');

var _ReactBlessedIDOperations2 = _interopRequireDefault(_ReactBlessedIDOperations);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _update = require('./update');

var _update2 = _interopRequireDefault(_update);

var _solveClass = require('./solveClass');

var _solveClass2 = _interopRequireDefault(_solveClass);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Variable types that must be solved as content rather than real children.
 */
var CONTENT_TYPES = { string: true, number: true };

/**
 * Renders the given react element with blessed.
 *
 * @constructor ReactBlessedComponent
 * @extends ReactMultiChild
 */

var ReactBlessedComponent = function () {
  function ReactBlessedComponent(tag) {
    _classCallCheck(this, ReactBlessedComponent);

    this._tag = tag.toLowerCase();
    this._updating = false;
    this._renderedChildren = null;
    this._previousStyle = null;
    this._previousStyleCopy = null;
    this._rootNodeID = null;
    this._wrapperState = null;
    this._topLevelWrapper = null;
    this._nodeWithLegacyProperties = null;
  }

  _createClass(ReactBlessedComponent, [{
    key: 'construct',
    value: function construct(element) {
      var _this = this;

      // Setting some properties
      this._currentElement = element;
      this._eventListener = function (type) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        if (_this._updating) return;

        var handler = _this._currentElement.props['on' + (0, _lodash.startCase)(type).replace(/ /g, '')];

        if (typeof handler === 'function') {
          if (type === 'focus' || type === 'blur') {
            args[0] = _ReactBlessedIDOperations2.default.get(_this._rootNodeID);
          }
          handler.apply(undefined, args);
        }
      };
    }

    /**
     * Mounting the root component.
     *
     * @internal
     * @param  {string} rootID - The root blessed ID for this node.
     * @param  {ReactBlessedReconcileTransaction} transaction
     * @param  {object} context
     */

  }, {
    key: 'mountComponent',
    value: function mountComponent(rootID, transaction, context) {
      this._rootNodeID = rootID;

      // Mounting blessed node
      var node = this.mountNode(_ReactBlessedIDOperations2.default.getParent(rootID), this._currentElement);

      _ReactBlessedIDOperations2.default.add(rootID, node);

      // Mounting children
      var childrenToUse = this._currentElement.props.children;
      childrenToUse = childrenToUse === null ? [] : [].concat(childrenToUse);

      if (childrenToUse.length) {

        // Discriminating content components from real children
        var _groupBy = (0, _lodash.groupBy)(childrenToUse, function (c) {
          return CONTENT_TYPES[typeof c === 'undefined' ? 'undefined' : _typeof(c)] ? 'content' : 'realChildren';
        }),
            _groupBy$content = _groupBy.content,
            content = _groupBy$content === undefined ? null : _groupBy$content,
            _groupBy$realChildren = _groupBy.realChildren,
            realChildren = _groupBy$realChildren === undefined ? [] : _groupBy$realChildren;

        // Setting textual content


        if (content) node.setContent('' + content.join(''));

        // Mounting real children
        this.mountChildren(realChildren, transaction, context);
      }

      // Rendering the screen
      _ReactBlessedIDOperations2.default.screen.debouncedRender();
    }

    /**
     * Mounting the blessed node itself.
     *
     * @param   {BlessedNode|BlessedScreen} parent  - The parent node.
     * @param   {ReactElement}              element - The element to mount.
     * @return  {BlessedNode}                       - The mounted node.
     */

  }, {
    key: 'mountNode',
    value: function mountNode(parent, element) {
      var props = element.props,
          type = element.type,
          children = props.children,
          options = _objectWithoutProperties(props, ['children']),
          blessedElement = _blessed2.default[type];

      (0, _invariant2.default)(!!blessedElement, 'Invalid blessed element "' + type + '".');

      var node = _blessed2.default[type]((0, _solveClass2.default)(options));

      node.on('event', this._eventListener);
      parent.append(node);

      return node;
    }

    /**
     * Receive a component update.
     *
     * @param {ReactElement}              nextElement
     * @param {ReactReconcileTransaction} transaction
     * @param {object}                    context
     * @internal
     * @overridable
     */

  }, {
    key: 'receiveComponent',
    value: function receiveComponent(nextElement, transaction, context) {
      var _nextElement$props = nextElement.props,
          children = _nextElement$props.children,
          options = _objectWithoutProperties(_nextElement$props, ['children']),
          node = _ReactBlessedIDOperations2.default.get(this._rootNodeID);

      this._updating = true;
      (0, _update2.default)(node, (0, _solveClass2.default)(options));
      this._updating = false;

      // Updating children
      var childrenToUse = children === null ? [] : [].concat(children);

      // Discriminating content components from real children

      var _groupBy2 = (0, _lodash.groupBy)(childrenToUse, function (c) {
        return CONTENT_TYPES[typeof c === 'undefined' ? 'undefined' : _typeof(c)] ? 'content' : 'realChildren';
      }),
          _groupBy2$content = _groupBy2.content,
          content = _groupBy2$content === undefined ? null : _groupBy2$content,
          _groupBy2$realChildre = _groupBy2.realChildren,
          realChildren = _groupBy2$realChildre === undefined ? [] : _groupBy2$realChildre;

      // Setting textual content


      if (content) node.setContent('' + content.join(''));

      this.updateChildren(realChildren, transaction, context);

      _ReactBlessedIDOperations2.default.screen.debouncedRender();
    }

    /**
     * Dropping the component.
     */

  }, {
    key: 'unmountComponent',
    value: function unmountComponent() {
      this.unmountChildren();

      var node = _ReactBlessedIDOperations2.default.get(this._rootNodeID);

      node.off('event', this._eventListener);
      node.destroy();

      _ReactBlessedIDOperations2.default.drop(this._rootNodeID);

      this._rootNodeID = null;

      _ReactBlessedIDOperations2.default.screen.debouncedRender();
    }

    /**
     * Getting a public instance of the component for refs.
     *
     * @return {BlessedNode} - The instance's node.
     */

  }, {
    key: 'getPublicInstance',
    value: function getPublicInstance() {
      return _ReactBlessedIDOperations2.default.get(this._rootNodeID);
    }
  }]);

  return ReactBlessedComponent;
}();

/**
 * Extending the component with the MultiChild mixin.
 */


exports.default = ReactBlessedComponent;
(0, _lodash.extend)(ReactBlessedComponent.prototype, _ReactMultiChild2.default.Mixin);