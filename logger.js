var path = require('path');

var levels = {debug:10, info:20, notice:30, warn:50, warning:50, error:70, critical:80, fatal:100};
var levelsDict = {string:{}, number:{}};

(function(){
  for (var key in levels) {
    var val = levels[key];
    var levelObj = {s: key, n: val};
    levelsDict['string'][key] = levelObj;
    levelsDict['number'][val] = levelObj;
  }
})();
var levelLimit = 0; //display all
var errorLimit = 70; //output >error to stderr
var useRelativePath = true;

function getLevel(level) {
  var levelType = levelsDict[typeof level];
  if (levelType) {
    var levelObj = levelType[level];
    if (typeof levelObj === 'undefined') {
      if (levelType === 'number') levelObj = {s:'level'+level, n:level};
      else throw new Error('Invalid log level.');
    }
    return levelObj;
  } else {
    throw new Error('Log level must be string or number.');
  }
}

function log(level, data) {
  var l = getLevel(level);
  if (l.n >= levelLimit) {
    var out = console.log;
    if (l.n >= errorLimit) out = console.error;
    var msg = '[' + (new Date()).toJSON() + '] [' + [l.s.toUpperCase()] + '] [' + this.filename + '] - ' + data;
    var args = Array.prototype.slice.call(arguments, 2);
    args.unshift(msg);
    out.apply(console, args);
    if ((typeof data === 'object') && (data!==null)) {
      if (data instanceof Error) console.log(data.stack);
      else console.log(data);
      console.log('');
    }
  }
}

function Logger(filename) {
  this.filename = filename;
}

/** Sets the current log level. Any log request specified at lower level will not be displayed. */
Logger.prototype.setLevel = function(level) {
  levelLimit = getLevel(level).n;
  return this;
};

/** Gets the current log level. */
Logger.prototype.getLevel = function(cb) {
  cb(levelLimit, getLevel(levelLimit).s);
  return this;
};

/** 
 * Sets the current error level. Error level specifies a level that is considered as an error or worse. 
 * A log request with specified level equal to or more than the error level will be sent to STDERR 
 */
Logger.prototype.setErrorThreshold = function(level) {
  errorLimit = getLevel(level).n;
  return this;
};

/** Gets the current error level. */
Logger.prototype.getErrorThreshold = function(cb) {
  cb(errorLimit, getLevel(errorLimit).s);
  return this;
};


/** @param value Set to true to make the logger print a shorter path relative to the main app. Default is true. */
Logger.prototype.useRelativePath = function(value) {
  useRelativePath = value;
  return this;
};

Logger.prototype.log = log;
(function() {
  for (var key in levels) {
    (function(level){
      Logger.prototype[level] = function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(level);
        log.apply(this, args);
      };
    })(key);
  }
})();

var factory = module.exports = function(cModule) {
  var filename = '';
  if (cModule) {
    if (typeof cModule == 'string') filename = cModule;
    else if (cModule.filename) filename = cModule.filename;
  }
  if (useRelativePath) filename = path.join(path.relative(process.cwd(), path.dirname(filename)), path.basename(filename));
  return new Logger(filename);
};

Object.defineProperties(factory, {
  level : {
    get: function() { return levelLimit; },
    set: function(level) { levelLimit = getLevel(level).n; }
    },
  errorThreshold : {
    get: function() { return errorLimit; },
    set: function(level) { errorLimit = getLevel(level).n; }
    },
});
