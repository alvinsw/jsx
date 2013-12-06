'use strict';
/**
 * Utilities for objects manipulation
 */

/**
 * Iterate object's own property
 * onEachProperty(key, value)
 */
var o = module.exports = {};

o.each = function(obj, onEachProperty) {
  if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
    throw new TypeError('Object.keys called on non-object');
  }  
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      onEachProperty(prop, obj[prop]);
    } 
  }
};

/**
 * Add all object's own properties in source to target. If overwrite is true, existing property will be replaced.
 */
o.merge = function (source, target, overwrite) {
  o.each(source, function(key, val) {
    if (overwrite || !(key in target)) {
      if (typeof val === 'object' && Object.getPrototypeOf(val) === Object.prototype) {
        var tval = target[key];
        if (typeof tval !== 'object' || Object.getPrototypeOf(tval) !== Object.prototype) {
          tval = target[key] = {};
        }
        o.merge(val, tval);
      } else {
        target[key] = val;
      }
    }
  });
  return target;
}

/**
 * Add all object's own properties in defaults to target, only if it does not exist in target.
 * If the type if property is different, the defaults has more priority.
 */
o.mergeDefaults = function (defaults, target) {
  o.each(defaults, function(key, val) {
    if (typeof val === 'object' && Object.getPrototypeOf(val) === Object.prototype) {
      var tval = target[key];
      if (typeof tval !== 'object' || Object.getPrototypeOf(tval) !== Object.prototype) {
        tval = target[key] = {};
      }
      o.mergeDefaults(val, tval);
    } else if (!(key in target) || (typeof val !== typeof target[key])) {
      target[key] = val;
    }
  });
  return target;
}