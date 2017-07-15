'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = update;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RAW_ATTRIBUTES = new Set([

// Alignment, Orientation & Presentation
'align', 'valign', 'orientation', 'shrink', 'padding', 'tags', 'shadow',

// Font-related
'font', 'fontBold', 'fch', 'ch', 'bold', 'underline',

// Flags
'clickable', 'input', 'keyable', 'hidden', 'visible', 'scrollable', 'draggable', 'interactive',

// Position
'left', 'right', 'top', 'bottom', 'aleft', 'aright', 'atop', 'abottom',

// Size
'width', 'height',

// Checkbox
'checked',

// Misc
'name']);

/**
 * Updates the given blessed node.
 *
 * @param {BlessedNode} node    - Node to update.
 * @param {object}      options - Props of the component without children.
 */
/**
 * React Blessed Update Schemes
 * =============================
 *
 * Applying updates to blessed nodes correctly.
 */
function update(node, options) {

  // TODO: enforce some kind of shallow equality?
  // TODO: handle position

  var selectQue = [];

  for (var key in options) {
    var value = options[key];

    if (key === 'selected' && node.select) selectQue.push({
      node: node,
      value: typeof value === 'string' ? +value : value
    });

    // Setting label
    else if (key === 'label') node.setLabel(value);

      // Removing hoverText
      else if (key === 'hoverText' && !value) node.removeHover();

        // Setting hoverText
        else if (key === 'hoverText' && value) node.setHover(value);

          // Setting content
          else if (key === 'content') node.setContent(value);

            // Updating style
            else if (key === 'style') node.style = _lodash2.default.merge({}, node.style, value);

              // Updating items
              else if (key === 'items') node.setItems(value);

                // Border edge case
                else if (key === 'border') node.border = _lodash2.default.merge({}, node.border, value);

                  // Textarea value
                  else if (key === 'value' && node.setValue) node.setValue(value);

                    // Progress bar
                    else if (key === 'filled' && node.filled !== value) node.setProgress(value);

                      // Table / ListTable rows / data
                      else if ((key === 'rows' || key === 'data') && node.setData) node.setData(value);else if (key === 'focused' && value && !node[key]) node.focus();

                        // Raw attributes
                        else if (RAW_ATTRIBUTES.has(key)) node[key] = value;
  }

  selectQue.forEach(function (_ref) {
    var node = _ref.node,
        value = _ref.value;
    return node.select(value);
  });
}