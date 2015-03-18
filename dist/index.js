"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var BasisObject = _interopRequire(require("./object"));

var BasisArray = _interopRequire(require("./array"));

var Model = _interopRequire(require("./model"));

var react = _interopRequireWildcard(require("./react"));

var util = _interopRequireWildcard(require("./util"));

var parsers = _interopRequireWildcard(require("./parsers"));

var pluralize = _interopRequire(require("pluralize"));

module.exports = Object.assign({
  Object: BasisObject,
  Array: BasisArray,
  A: BasisArray.of,
  Model: Model,
  pluralize: pluralize,
  ReactPropsMixin: react.PropsMixin,
  ReactStateMixin: react.StateMixin
}, util, parsers);
