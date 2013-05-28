exports.traversal = {};

function defaultEnumerator(container, onEachItem) {
  var val, i;
  if (Array.isArray(container)) {
    for (i = 0; i<container.length; ++i) {
      val = onEachItem(container[i]);
      if (val) return val;
    }
  } else {
    var keys = Object.keys(container);
    for (i = 0; i<keys.length; ++i) {
      val = onEachItem(container[keys[i]]);
      if (val) return val;
    }
  }
}

function defaultReverseEnumerator(container, onEachItem) {
  var val, i;
  if (Array.isArray(container)) {
    for (i=container.length; i--; ) {
      val = onEachItem(container[i]);
      if (val) return val;
    }
  } else {
    var keys = Object.keys(container);
    for (i = keys.length; i--; ) {
      val = onEachItem(container[keys[i]]);
      if (val) return val;
    }
  }
}

/** if onEachItem return true, the function will return and traversal terminates */
exports.bfsTree = function(root, onEachItem, getContainer, forEach) {
  forEach = forEach || defaultEnumerator;
  getContainer = getContainer || function(e){return e;};
  var queue = [root];
  while (queue.length > 0) {
    var node = queue.shift();
    var val = onEachItem(node);
    if (val) return val;
    var children = getContainer(node);
    if (children) forEach(children, function(child) { queue.push(child); });
  }
};

exports.dfsTree = function(root, onEachItem, getContainer, forEach) {
  forEach = forEach || defaultReverseEnumerator;
  getContainer = getContainer || function(e){return e;};
  var stack = [root];
  while (stack.length > 0) {
    var node = stack.pop();
    var val = onEachItem(node);
    if (val) return val;
    var children = getContainer(node);
    if (children) forEach(children, function(child) { stack.push(child); });
  }
};
