'use strict';

var forEachReverse = require('./algorithm').forEachReverse;

exports.each = exports.forEach = function(container, onEachItem, onFinish) {
  var stack = [];
  forEachReverse(container, function(val) { stack.push(val) });
  (function next(err) {
    if (err) return onFinish(err);
    var item = stack.pop();
    var nextCb = onFinish;
    if (item != null) nextCb = function() { onEachItem(item, next); };
    process.nextTick(nextCb);
  })();
}

