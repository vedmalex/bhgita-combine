function get(data, path) {
  if (Array.isArray(data)) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
      result.push(get(data[i], path));
    }
    return result;
  } else if (data instanceof Object) {
    if (data[path] === undefined) {
      var parts = path.split('.');
      if (Array.isArray(parts)) {
        var curr = parts.shift();
        if (parts.length > 0) {
          return get(data[curr], parts.join('.'));
        }
        return data[curr];
      }
    }
    return data[path];
  }
  return data;
}

exports.get = get;
