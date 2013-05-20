/** Various array utilities */

/** Flatten an array of array */
exports.flatten = function(inputArray, excludeEmpty) {
  var outputArray = [];
  var i, j, item, item2;
  for (i = 0; i < inputArray.length; ++i) {
    item = inputArray[i];
    if (excludeEmpty || item != null) {
      if (Array.isArray(inputArray)) {
        for (j = 0; j < item.length; ++j) {
          item2 = item[j];
          if (excludeEmpty || item2 != null) outputArray.push(item2);
        }
      } else {
        outputArray.push(item);
      }
    }
  }
  return outputArray;
};
