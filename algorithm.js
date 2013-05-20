exports.traversal = {};

function defaultEnumerator(container, onEachItem) {
  if (typeof container !== 'object') return;
  var val;
  if (Array.isArray(container)) {
    for (var i=0; i<container.length; ++i) {
      val = onEachItem(container[i]);
      if (val) return val;
    }
  } else {
    for (var key in container) {
      val = onEachItem(container[key]);
      if (val) return val;
    }
  }
}


exports.bfsTree = function(container, onEachItem, getChildren, forEach) {
  if (typeof container !== 'object') return;
  forEach = forEach || defaultEnumerator;
  getChildren = getChildren || function(e){return e;};
  var queue = [container];
  while (queue.length > 0) {
    var c = queue.shift();
    forEach(c, function(element) {
      var ret = onEachItem(element);
      if (ret) return ret;
      var children = getChildren(element);
      if (children) queue.push(children);
    });
  }
};

exports.dfsTree = function(container, onEachItem, getChildren, forEach) {
  if (typeof container !== 'object') return;
  forEach = forEach || defaultEnumerator;
  getChildren = getChildren || function(e){return e;};
  var stack = [container];
  while (stack.length > 0) {
    var c = stack.pop();
    forEach(c, function(element) {
      var ret = onEachItem(element);
      if (ret) return ret;
      var children = getChildren(element);
      if (children) stack.push(children);
    });
  }
};
