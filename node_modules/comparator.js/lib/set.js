function set(data, path, value) {
  if ('object' === typeof data) {
    var parts = path.split('.');
    if (Array.isArray(parts)) {
      var curr = parts.shift();
      if (parts.length > 0) {
        if (!data[curr]) {
          if (isNaN(parts[0]))
            data[curr] = {};
          else data[curr] = [];
        }
        set(data[curr], parts.join('.'), value);
      } else data[path] = value;
    } else {
      data[path] = value;
    }
  }
}

exports.set = set;