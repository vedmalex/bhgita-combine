function unfold(data, _result, _propName) {
	var result = _result ? _result : {};
	var propName = _propName ? _propName : '';
	var i, len;
	if (Array.isArray(data)) {
		for (i = 0, len = data.length; i < len; i++) {
			unfold(data[i], result, (propName ? (propName + '.') : '') + i);
		}
	} else if ('object' == typeof data) {
		var keys = Object.keys(data);
		for (i = 0, len = keys.length; i < len; i++) {
			unfold(data[keys[i]], result, (propName ? (propName + '.') : '') + keys[i]);
		}
	} else {
		result[propName] = data;
	}
	return result;
}

function fold(data) {
	var result = {};
	var keys = Object.keys(data);
	for (var i = 0, len = keys.length; i < len; i++) {
		set(result, keys[i], data[keys[i]]);
	}
	return result;
}

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

function get(data, path) {
	if ('object' === typeof data) {
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
exports.set = set;
exports.fold = fold;
exports.unfold = unfold;