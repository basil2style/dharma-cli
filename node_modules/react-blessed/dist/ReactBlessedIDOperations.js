'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * React Blessed ID Operations
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * ============================
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Cache register for blessed nodes stored by ID.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _lodash = require('lodash');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The blessed nodes internal index;
 */
var blessedNodes = {};

/**
 * Backend for blessed ID operations.
 *
 * @constructor ReactBlessedIDOperations
 */

var ReactBlessedIDOperations = function () {
  function ReactBlessedIDOperations() {
    _classCallCheck(this, ReactBlessedIDOperations);

    this.screen = null;
  }

  /**
   * Set the current screen.
   *
   * @param  {BlessedScreen} screen     - The screen to attach.
   * @return {ReactBlessedIDOperations} - Returns itself.
   */


  _createClass(ReactBlessedIDOperations, [{
    key: 'setScreen',
    value: function setScreen(screen) {
      this.screen = screen;

      // Creating a debounced version of the render method so we won't render
      // multiple time per frame, in vain.
      screen.debouncedRender = (0, _lodash.debounce)(function () {
        return screen.render();
      }, 0);

      return this;
    }

    /**
     * Add a new node to the index.
     *
     * @param  {string}      ID           - The node's id.
     * @param  {BlessedNode} node         - The node itself.
     * @return {ReactBlessedIDOperations} - Returns itself.
     */

  }, {
    key: 'add',
    value: function add(ID, node) {
      blessedNodes[ID] = node;
      return this;
    }

    /**
     * Get a node from the index.
     *
     * @param  {string}      ID - The node's id.
     * @return {BlessedNode}    - The node.
     */

  }, {
    key: 'get',
    value: function get(ID) {
      return blessedNodes[ID];
    }

    /**
     * Get the parent of a node from the index.
     *
     * @param  {string}                    ID - The node's id.
     * @return {BlessedScreen|BlessedNode}    - The node.
     */

  }, {
    key: 'getParent',
    value: function getParent(ID) {

      // If the node is root, we return the screen itself
      if (ID.match(/\./g).length === 1) return this.screen;

      var parentID = ID.split('.').slice(0, -1).join('.');
      return this.get(parentID);
    }

    /**
     * Drop a node from the index.
     *
     * @param  {string}                   ID - The node's id.
     * @return {ReactBlessedIDOperations}    - Returns itself.
     */

  }, {
    key: 'drop',
    value: function drop(ID) {
      delete blessedNodes[ID];
      return this;
    }
  }]);

  return ReactBlessedIDOperations;
}();

exports.default = new ReactBlessedIDOperations();