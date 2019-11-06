var set = require('./set').set;

function fold(data) {
  var result = {};
  var keys = Object.keys(data);
  for (var i = 0, len = keys.length; i < len; i++) {
    set(result, keys[i], data[keys[i]]);
  }
  return result;
}

exports.fold = fold;