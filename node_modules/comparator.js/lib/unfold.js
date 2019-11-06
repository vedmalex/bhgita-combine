function unfold(data, _result, _propName, stack) {
  var result = _result ? _result : {};
  var propName = _propName ? _propName : '';
  var i, len;

  if (Array.isArray(data)) {
    for (i = 0, len = data.length; i < len; i++) {
      unfold(data[i], result, (propName ? (propName + '.') : '') + i, stack);
    }
  } else if (data && data.constructor === Object) {
    var keys = Object.keys(data);
    for (i = 0, len = keys.length; i < len; i++) {
      unfold(data[keys[i]], result, (propName ? (propName + '.') : '') + keys[i], stack);
    }
  } else {
    result[propName] = data;
  }
  return result;
}

exports.unfold = unfold;