/** Various string utilities */
exports.endsWith = function(text, suffix) {
  return text.indexOf(suffix, text.length - suffix.length) !== -1;
};

exports.startsWith = function(text, prefix) {
  return text.indexOf(prefix) === 0;
};
