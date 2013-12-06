var typeCheck = def(process.env.NODE_JSX_TYPECHECK, 1);

/**
 * A Utility object to manage namespace-like structure using javascript objects
*/
var Namespace = {
  _g: this
  /** 
   * Gets the object given the namespace.object format in string.
   * @name A string of the full namespace. eg: "org.company.Component"
   */
  , get: function(name) {
    var parts = name.split(/\./);
    var obj = Namespace._g;
    for (var i in parts) {
      obj = obj[parts[i]];
      if (!obj) throw new Error('Namespace ' + name + ' is undefined');
    }
    return obj;
  }
  /** 
   * Creates a namespace according to the give string, or returns an existing one.
   * @name A string or array of the full namespace. eg: "org.company.Component" or ["org","company","Component"]
   */
  , create: function(name) {
    var parts;
    if (Array.isArray(name)) parts=name;
    else parts = name.split(/\./);
    var obj = Namespace._g;
    for (var i in parts) {
      if (!obj[parts[i]]) obj[parts[i]]={};
      obj = obj[parts[i]];
    }
    return obj;
  }
};

/**
 * A helper to create classes that can be easily extended.
 * @definition An object with the following properties:
 *   _extends is used for inheritance. For example:
 *     _extends: Class1
 *   Multiple inheritance is supported by supplying an array of Classes to _extend property.
 *     _extend: [Class1, Class2, ...]
 *   Use with care. A new object is created to combine all the properties of the super classes. If there are properties with the same name, the subsequent classes will override the previous one.
 *   Using this._super() will invoke the contructor of all super classes.
 *
 *   _static: An object that contains any static methods or properties.
 *   _init: function that will be used as the object constructor.
 */
function Class(name, definition) {
  if (!name) throw new Error("Class must have a name.");
  // Setup namespace
  var ns = this, parts = name.split(/\./), className = parts.pop();
  if (parts.length > 0) ns = Namespace.create(parts);
  if (ns[className]) throw new Error("An class with same name exist.");
  
  var classObject;
  var classProto, m, parents=[];

  if (definition) {
    // Setup constructor
    if (typeof definition._init == "function") {
      classObject = definition._init;
    }
    
    function getParentsAsArray() {
      var a, p = definition._extends;
      if (p) {
        if (Array.isArray(p)) a = p; else a = [p];
      } else { 
        a = [];
      }
      return a;
    }
    parents = getParentsAsArray();
    
    // Evaluate super/base classes, setup inheritance
    if (parents.length > 0) {
      // single inheritance, use prototype chain
      var parent = parents[0];
      
      // multiple inheritance, create a combined class template from all the parent classes
      if (parents.length > 1) {
        var mproto={}, mcons=[];
        for (var i=0, l=parents.length; i < l; ++i) {
          for (var j=i+1; j < l; ++j) {
            if (parents[i]===parents[j] || parents[i].isSubclassOf(parents[j]) || parents[j].isSubclassOf(parents[i]))
              throw new Error("Class definition error: invalid multiple inheritance.");
          }
          for (var prop in parents[i].prototype) {
            if (prop == "constructor") {
              mcons.push(parents[i].prototype[prop]);
            } else if (prop[0] != "_") {
              mproto[prop] = parents[i].prototype[prop];
            }
          }
        }
        // Set constructor
        parent = function MultiInheritConstructor(){
          for (var i=0, l=mcons.length; i < l; ++i) {
            var tmp = this._super;
            this._super = mcons[i].prototype._super;
            mcons[i].apply(this, arguments);
            this._super = tmp;
          }          
        };
        parent.prototype = mproto;
        parent.prototype.constructor = parent;
      }
      
      if (!classObject) {
        // If constructor is not defined, use parent's class constructor
        eval('classObject = function ' + className + '() { this._super() }');
      }
      
      // Set prototype as an instance of function object so that it can extend other classes
      var ClassProto = function(){};
      ClassProto.prototype = parent.prototype;
      classProto = new ClassProto();
      classProto.constructor = classObject;
      classProto._super = function() {
        parent.apply(this, arguments);
      };
      classObject.prototype = classProto;
    } else if (!classObject) {
      // no parent and no constructor defined
      eval('classObject = function ' + className + '(){};');
    }
    
    // Set class-level static methods
    var sm = definition._static;
    for (m in sm) {
      classObject[m] = sm[m];
    }
    
    // Set normal public methods, copied from the class definition
    delete definition._extends;
    delete definition._init;
    delete definition._static;
    classProto = classObject.prototype;
    for (m in definition) {
      classProto[m] = definition[m];
    }
  } else {
    // no parent and no constructor defined
    eval('classObject = function ' + className + '(){};');
  }

  classObject.className = className;
  classObject.superClasses = parents;
  classObject.isSubclassOf = function isSubclassOf(c) {
    if (this === c) return false;
    var visited = {};
    var stack = [this];
    visited[this.className] = true;
    while (stack.length > 0) {
      var s = stack.pop();
      if (s === c) return true;
      for (var i=0, l=s.superClasses.length; i < l; ++i) {
        var p = s.superClasses[i];
        if (!visited[p.className]) {
          visited[p.className] = true;
          stack.push(p);
        }
      }
    }
    return false;
  };

  /** Get the Class of this instance */
  classObject.prototype._getClass = function getClass() {
    return classObject;
  };
  
  /** Invoke any method of the superclasses to this object */
  classObject.prototype._invoke = function invoke(classObj, methodName, args) {
    return classObj.prototype[methodName].apply(this, args);
  };
  
  // put class object to the namespace
  ns[className] = classObject;

  return classObject;
}

function isUndef(v){
  return (typeof v === 'undefined');
}

/**
 * A helper to set an options object with default values
 */
function Options(given, defaults) {
  var opt;
  if (typeof given === 'object') {
    opt = JSON.parse(JSON.stringify(given));
  } else {
    opt = { _single : given };
  }
  for (var key in defaults) {
    if (typeof opt[key] === 'undefined') opt[key] = defaults[key];
  }
  return opt;
}

/** Check for undefined and provide default value */
function def(val, defVal) {
  return (null != val ? val : defVal);
}

/** Check for undefined and accepted type and provide default value */
function deftc(val, defVal, validTypes) {
  if (null == val) return defVal;
  if (null == validTypes) return val;
  if (!Array.isArray(validTypes)) validTypes = [validTypes];
  var onEachType = function(typeName){ return typeof val === typeName; };
  if (validTypes.some(onEachType)) return val;
  else throw new TypeError('Argument type does not match any of: ' + validTypes.toString());
}

if (typeCheck) exports.def = deftc;
else exports.def = def;

exports.mapArgs = function(specs, cb) {
  return function() {
    var newArgs = [];
    var i;
    var j = 0;
    specs.forEach(function(spec) { newArgs.push(spec[1]); });
    for (i = 0; i < arguments.length; ++i) {
      var val = arguments[i];
      while (j < specs.length - (arguments.length - 1 - i)) {
        if (typeof val === specs[j][0]) {
          newArgs[j++] = val;
          val = undefined;
          break;
        }
        j++;
      }
      if (null != val) throw new TypeError('Type mismatch at argument ' + i );
    }
    return cb.apply(this, newArgs);
  }
}

exports.Namespace = Namespace;
exports.Class = Class;
exports.Options = Options;
exports.createLogger = require('./logger');
exports.Wildcard = require('./Wildcard');
exports.fsx = require('./fsx');
exports.string = require('./string');
exports.array = require('./array');
exports.object = require('./object');
exports.algo = exports.algorithm = require('./algorithm');
exports.async = require('./async');

exports.forEach = exports.algo.forEach;
exports.forEachReverse = exports.algo.forEachReverse;
