'use strict';
/*
 jQuery.extend extracted from the jQuery source & optimised for NodeJS
 Twitter: @FGRibreau / fgribreau.com

 Usage:
 var Extend = require('./Extend');


 // Extend
 var obj = Extend({opt1:true, opt2:true}, {opt1:false});

 // Deep Copy
 var clonedObject = Extend(true, {}, myObject);
 var clonedArray = Extend(true, [], ['a',['b','c',['d']]]);
 */
var toString = Object.prototype.toString;
var hasOwn = Object.prototype.hasOwnProperty;
var push = Array.prototype.push;
var slice = Array.prototype.slice;
var trim = String.prototype.trim;
var indexOf = Array.prototype.indexOf;
// [[Class]] -> type pairs
var class2type = {};

// Populate the class2type map
"Boolean Number String Function Array Date RegExp Object".split(" ").forEach(function (name) {
  class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function type(obj) {
  return obj == null ? String(obj) : class2type[ toString.call(obj) ] || "object";
}

function isPlainObject(obj) {
  if (!obj || type(obj) !== "object") {
    return false;
  }

  // Not own constructor property must be Object
  if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  var key;
  for (key in obj) {}
  return key === undefined || hasOwn.call(obj, key);
}

function extend() {
  var options;
  var name;
  var src;
  var copy;
  var copyIsArray;
  var clone;
  var target = arguments[0] || {};
  var i = 1;
  var length = arguments.length;
  var deep = false;

  // Handle a deep copy situation
  if (typeof target === "boolean") {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== "object" && type(target) !== "function") {
    target = {};
  }

  // extend jQuery itself if only one argument is passed
  if (length === i) {
    target = this;
    --i;
  }

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    if ((options = arguments[ i ]) != null) {
      // Extend the base object
      for (name in options) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if (deep && copy && ( isPlainObject(copy) || (copyIsArray = type(copy) === "array") )) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && type(src) === "array" ? src : [];

          } else {
            clone = src && isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = extend(deep, clone, copy);

          // Don't bring in undefined values
        } else if (copy !== undefined) {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
}


/**
 * Extends `target` with properties from `source`.
 */
exports.deepExtend = function (target, source) {
  return extend(true, target, source);
};


exports.shallowExtend = function (target, source) {
  return extend(target, source);
};


exports.clone = function (o) {
  var result;

  if (isPlainObject(o)) {
    result = extend(true, {}, o);
  }
  if (type(o) == "array") {
    result = extend(true, [], o);
  }
  return result;
};


/**
 * Deep clones `target`, then deep extends the clone with `source`.
 */
exports.cloneExtend = function (target, source) {
  var result = exports.clone(target);
  return exports.extend(result, source);
};


exports.shallowClone = function (o) {
  if (isPlainObject(o)) {
    o = extend(false, {}, o);
  }
  if (type(o) == "array") {
    o = extend(false, [], o);
  }
  return o;
};
