function Equality() { }

Equality.false = function () {
  return false;
};

Equality.true = function () {
  return true;
};

Equality.NOT_EQUAL = 0;
Equality.STRICT = 1;
Equality.LOOSE = 2;
Equality.STRUCTURE = 3;

/*
	0 - notEqual,
	1 - strict
	2 - loose
	3 - structure
*/

Equality.diffValue = function (a, b, comprator) {
  if (a === b) return {
    result: Equality.STRICT,
    value: b
  };
  if (a != null && b != null && a.valueOf() == b.valueOf()) return {
    result: Equality.LOOSE,
    from: a,
    to: b
  };
  return {
    result: Equality.NOT_EQUAL,
    from: a,
    to: b
  };
};

Equality.diffString = function (a, b, comprator) {
  if (a === b) return {
    result: Equality.STRICT,
    value: b
  };
  if (a.toString() == b.toString()) return {
    result: Equality.LOOSE,
    from: a,
    to: b
  };
  return {
    result: Equality.NOT_EQUAL,
    from: a,
    to: b
  };
};

// diff содержит только поля которые изменились ??
Equality.eqObject = function (config) {
  if (config.strict) {
    // строгое равенство структура + данные
    return function (source, dest, compare) {
      if (source == dest) return true;
      var ks = Object.keys(source);
      var kd = Object.keys(dest);
      var ret, key;
      var so = ks.toString() == kd.toString();
      if (so) {
        for (var i = 0, len = ks.length; i < len; i++) {
          key = ks[i];
          if (!compare(source[key], dest[key]))
            return false;
        }
      } else {
        return false;
      }
      return true;
    };
  }

  if (config.loose) {
    // второй объект может содержать дополнительные поля, но мы их не рассматриваем.
    // структура и равенство*(compare) того что есть с тем что дали
    return function (source, dest, compare) {
      if (source == dest) return true;
      var ks = Object.keys(source);
      var kd = Object.keys(dest);
      var ret, key;
      for (var i = 0, len = ks.length; i < len; i++) {
        key = ks[i];
        if (!compare(source[key], dest[key])) return false;
      }
      return true;
    };
  }

  if (config.structure) {
    // проверяем что структура объекта такая же
    // второй объект может содержать новые поля,
    // и новые данные, но структура та же
    return function (source, dest, compare) {
      if (source == dest) return true;
      var ks = Object.keys(source);
      var kd = Object.keys(dest);
      var ret, i, len, key;
      if (ks.length > kd.length) return false;
      var so = ks.toString() == kd.toString();
      if (so) {
        for (i = 0, len = ks.length; i < len; i++) {
          key = ks[i];
          if (!compare(source[key], dest[key])) return false;
        }
      } else {
        var ksd = Object.keys(source).sort();
        var kss = Object.keys(dest).sort();
        var passed = {};
        for (i = 0, len = ksd.length; i < len; i++) {
          key = ksd[i];
          passed[key] = 1;
          if (!compare(source[key], dest[key])) return false;
        }
        if (Object.keys(passed).sort().toString() != ksd.toString()) return false;
      }
      return true;
    };
  }

  if (config.diff) {
    // full processing
    // здесь мы должны получить все варианты сразу
    // strict
    // loose
    // structure
    // diff
    return function (source, dest, compare) {
      if (source == dest) return {
        result: 1,
        value: dest
      };
      var result = {};
      var i, len, key, ret;
      var ks = Object.keys(source);
      var kd = Object.keys(dest);
      var so = ks.toString() == kd.toString();
      if (so) {
        result.result = 1;
        for (i = 0, len = ks.length; i < len; i++) {
          key = ks[i];
          ret = result[key] = compare(source[key], dest[key]);
          if (ret.result === 0) ret.result = 3;
          if (ret.result > 0 && result.result < ret.result)
            result.result = ret.result;
        }
      } else {
        result.result = 1;
        var ksd = Object.keys(source).sort();
        var kss = Object.keys(dest).sort();
        result.reorder = ks.toString() != kd.toString();
        var passed = {};
        var srcI, dstI;
        for (i = 0, len = ksd.length; i < len; i++) {
          key = ksd[i];
          passed[key] = true;
          srcI = ks.indexOf(key);
          dstI = kd.indexOf(key);
          if (dstI >= 0) {
            result[key] = {};
            if (srcI != dstI)
              result[key].order = {
                from: ks.indexOf(key),
                to: kd.indexOf(key)
              };
            ret = result[key].value = compare(source[key], dest[key]);
            if (ret.result === 0) ret.result = 3;
            // structure of current object isn't changed
            if (ret.result > 0 && result.result < ret.result)
              result.result = ret.result;
          } else {
            // removed items
            result.result = 0;
            if (!result.removed) result.removed = {};
            result.removed[key] = {
              order: ks.indexOf(key),
              value: source[key]
            };
          }
        }
        // new items
        for (i = 0, len = kss.length; i < len; i++) {
          key = kss[i];
          if (passed[key] === true) continue;
          // if (result.result > 0) result.result = 2;
          passed[key] = true;
          if (!result.inserted) result.inserted = {};
          result.inserted[key] = {
            order: kd.indexOf(key),
            value: dest[key]
          };
        }
      }
      return result;
    };
  }
};

Equality.eqArray = function (config) {
  // strict -- полное равенство
  // loose -- объекты перемешаны, пересортированы, но все на месте
  // structure -- объекты на своих местах и каждый имеет свою структуру.
  // diff
  // diff reorder массивы простых значений только если
  // нужно придумать условия
  // 1. когда длинна одинаковая
  // 2. когда меншье стала
  // 3. когда больше стала
  // или забить :)
  // сделать для каждого типа свою функцию как в объекте
  if (config.strict || config.structure) {
    return function (source, dest, compare) {
      if (source == dest) return {
        result: 1,
        value: dest
      };
      if ((source && dest && source.length == dest.length)) {
        for (var i = 0, len = source.length; i < len; i++) {
          if (!compare(source[i], dest[i])) return false;
        }
        return true;
      } else
        return false;
    };
  }
  if (config.loose) {
    return function (source, dest, compare) {
      if (source == dest) return {
        result: 1,
        value: dest
      };
      var val, i, len;
      var foundItems = [];
      foundItems.length = source.length > dest.length ? source.length : dest.length;
      if ((source && dest && source.length <= dest.length)) {
        for (i = 0, len = source.length; i < len; i++) {
          val = source[i];
          var rec, cmpRes, found;
          for (var j = 0, dstlen = dest.length; j < dstlen; j++) {
            rec = dest[j];
            cmpRes = compare(val, rec);
            if (cmpRes) {
              found = rec;
              if (!foundItems[j])
                break;
            } else {
              found = undefined;
              dstI = -1;
            }
          }
          if (!found) return false;
        }
        return true;

      } else
        return false;
    };
  }
  if (config.diff) {
    return function (source, dest, compare) {
      if (source == dest) return {
        result: 1,
        value: dest
      };

      if (JSON.stringify(source) == JSON.stringify(dest)) return {
        result: 1,
        value: dest
      };

      var result = {
        result: 1,
        reorder: true,
      };

      function compareRatings(a, b) {
        return a.cmpRes.changeRating < b.cmpRes.changeRating;
      }
      var val, i, len;
      var foundItems = [];
      foundItems.length = source.length > dest.length ? source.length : dest.length;
      var srcI, dstI;
      for (i = 0, len = source.length; i < len; i++) {
        val = source[i];
        var rec, cmpRes, found, approx = [];
        for (var j = 0, dstlen = dest.length; j < dstlen; j++) {
          rec = dest[j];
          cmpRes = compare(val, rec);
          if (cmpRes.result > 0 && cmpRes.result < 3) {
            found = rec;
            dstI = dest.indexOf(rec);
            if (!foundItems[j])
              break;
          } else if (cmpRes.result === 3) {
            approx.push({
              found: rec,
              dstI: dest.indexOf(rec),
              cmpRes: cmpRes
            });
          } else {
            found = undefined;
            dstI = -1;
          }
        }
        srcI = source.indexOf(val);

        if (!found && approx.length > 0) {
          debugger;
          approx.sort(compareRatings);
          var aFound = approx.shift();
          found = aFound.found;
          dstI = aFound.dstI;
          cmpRes = aFound.cmpRes;
          approx.length = 0;
        }

        if (found) {
          result[i] = {};
          if (srcI != dstI) {
            result[i].order = {
              from: srcI,
              to: dstI
            };
          }
          foundItems[dstI] = true;
          result[i].value = cmpRes;
          if (cmpRes.result > 1 && result.result !== 0) result.result = cmpRes.result;
        } else {
          result.result = 0;
          if (!result.removed) result.removed = {};
          result.removed[i] = {
            order: dstI,
            value: val
          };
        }
      }
      for (i = 0, len = dest.length; i < len; i++) {
        val = dest[i];
        if (foundItems[i] === true) continue;
        if (!result.inserted) result.inserted = {};
        // if (result.result > 0) result.result = 2;
        result.inserted[i] = {
          order: i,
          value: val
        };
      }

      if (!config.diff) {
        var res = true;
        for (var v in result) {
          res = res && result[v];
          if (!res) break;
        }
        return res;
      } else
        return result;
    };
  }
};

var Compariable = require('./mapping.js').cmp(Equality);

function getComparator(a, b, type) {
  var cmpr = Compariable[a][b];
  var res = cmpr ? cmpr[type] : null;
  if (!res) {
    cmpr = Compariable[b][a];
    res = cmpr ? cmpr[type] : null;
  }
  if (!res) {
    switch (type) {
      case 'strict':
        return Equality.false;
      case 'loose':
        return Equality.false;
      case 'structure':
        return Equality.false;
      case 'diff':
        return Equality.diffValue;
    }
  } else return res;
}

function getType(v) {
  return Object.prototype.toString.call(v).match(/\[object (.+)\]/)[1];
}

function strictEq(a, b) {
  var t0 = getType(a);
  var t1 = getType(b);
  var fnc = getComparator(t0, t1, 'strict');
  return fnc(a, b, strictEq);
}

function looseEq(a, b) {
  var t0 = getType(a);
  var t1 = getType(b);
  var fnc = getComparator(t0, t1, 'loose');
  return fnc(a, b, looseEq);
}

function structureEq(a, b) {
  var t0 = getType(a);
  var t1 = getType(b);
  var fnc = getComparator(t0, t1, 'structure');
  return fnc(a, b, structureEq);
}

function diff(a, b) {
  var t0 = getType(a);
  var t1 = getType(b);
  var fnc = getComparator(t0, t1, 'diff');
  return fnc(a, b, diff);
}

exports.getComparator = getComparator;
exports.strictEq = strictEq;
exports.looseEq = looseEq;
exports.structureEq = structureEq;
exports.diff = diff;