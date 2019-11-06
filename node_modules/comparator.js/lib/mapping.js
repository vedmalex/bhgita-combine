// default strict = eq.false;
// default loose = eq.false;
// default structure = eq.false;
// default diff =eq.diffValue

// проверить работу, посде доделать адресно для каждого типа 
// так чтобы знать какой параметр каким приходит
// чтобы было меньше проверок
var jsdiff = require('diff');

exports.cmp = function(eq) {
	return {
		"Boolean": {
			"Boolean": {
				strict: function(a, b) {
					return a === b;
				},
				loose: function(a, b) {
					return a == b;
				},
				structure: eq.true,
			},
			"Number": {
				loose: function(a, b) {
					return a == b;
				}
			},
			"String": {
				loose: function(a, b) {
					var bFalse = /false/i.test(b) || /0/.test(b);
					var bTrue = /true/i.test(b) || /1/.test(b);
					if (a) return a === bTrue;
					else return a === !bFalse;
				},
				diff: function(a, b) {
					var res;
					var bFalse = /false/i.test(b) || /0/.test(b);
					var bTrue = /true/i.test(b) || /1/.test(b);
					if (a) res = a === bTrue;
					else res = a === !bFalse;
					if (res) return {
						result: eg.LOOSE,
						from: a,
						to: b
					};
					return {
						result: eq.NOT_EQUAL,
						from: a,
						to: b
					};
				}
			},
			"Undefined": {
				loose: function(a, b) {
					return !a == !b;
				}
			},
			"Null": {
				loose: function(a, b) {
					return !a == !b;
				}
			}
		},
		"Number": {
			"Number": {
				strict: function(a, b) {
					return a === b;
				},
				loose: function(a, b) {
					return a == b;
				},
				structure: eq.true,
			},
			"String": {
				loose: function(a, b) {
					return a == b;
				},
			},
			"Date": {
				strict: function(a, b) {
					return a == b;
				},
				loose: function(a, b) {
					return a.valueOf() == b.valueOf();
				},
				structure: eq.true
			},
			"Null": {
				loose: function(a, b) {
					return !a == !b;
				}
			},
			"Undefined": {
				loose: function(a, b) {
					return !a == !b;
				},
			},
			"Object": {
				loose: function(a, b) {
					return a.toString() == b.toString();
				},
			},
			"Function": {
				loose: function(a, b) {
					return a.toString() == b.toString();
				},
			}
		},
		"String": {
			"Boolean": {
				loose: function(a, b) {
					var aFalse = /false/i.test(a) || /0/.test(a);
					var aTrue = /true/i.test(a) || /1/.test(a);
					if (b) return b === aTrue;
					else return b === !aFalse;
				},
				diff: function(a, b) {
					var res;
					var aFalse = /false/i.test(a) || /0/.test(a);
					var aTrue = /true/i.test(a) || /1/.test(a);
					if (b) res = b === aTrue;
					else res = b === !aFalse;
					if (res) return {
						result: eq.LOOSE,
						from: a,
						to: b
					};
					return {
						result: eq.NOT_EQUAL,
						from: a,
						to: b
					};
				}
			},
			"String": {
				strict: function(a, b) {
					return a == b;
				},
				loose: function(a, b) {
					return a == b;
				},
				structure: eq.true,
				diff: function(a, b) {
					if (a == b) return {
						result: 1,
						value: b
					};
					var result = jsdiff.diffLines(a, b);
					var srcLen = a.length;
					var dstLen = b.length;
					var unchangedCnt = 0;
					var unchangedLen = 0;
					var removedCnt = 0;
					var removedLen = 0;
					var addedCnt = 0;
					var addedLen = 0;

					result.forEach(function(part) {
						if (part.added) {
							addedCnt++;
							addedLen += part.value.length;
						} else
						if (part.removed) {
							removedCnt++;
							removedLen += part.value.length;
						} else {
							unchangedCnt++;
							unchangedLen += part.value.length;
						}
					});
					if (unchangedCnt === 1 && addedCnt === 0 && removedCnt === 0) {
						return {
							result: eq.LOOSE,
							diff: "lines",
							changes: result
						};
					}
					if (unchangedCnt > 0 && (addedCnt > 0 || removedCnt > 0)) {
						return {
							result: eq.STRUCTURE,
							diff: "lines",
							changes: result,
							/*srcLen: ((addedLen > removedLen) ? dstLen : srcLen),
							removedLen: removedLen,
							addedLen: addedLen,*/
							changeRating: Math.abs(addedLen - removedLen) / ((addedLen > removedLen) ? dstLen : srcLen)
						};
					}

					return {
						result: eq.NOT_EQUAL,
						diff: "lines",
						from: a,
						to: b
					};
				}
			},
			"RegExp": {
				strict: function(a, b) {
					return a == b;
				},
				loose: function(a, b) {
					return a.toString() == b.toString();
				},
				structure: eq.false
			},
			"Date": {
				strict: function(a, b) {
					if (a.toString() == b.toString()) return true;

					if (a.toJSON || b.toJSON) {
						var v0, v1;
						if (a.toJSON) v0 = a.toJSON();
						else v0 = value.toString();

						if (b.toJSON) v1 = b.toJSON();
						else v1 = value.toString();
						return v0 == v1;
					} else return false;
				},
				loose: function(a, b) {
					if (a.toString() == b.toString()) return true;

					if (a.toJSON || b.toJSON) {
						var v0, v1;
						if (a.toJSON) v0 = a.toJSON();
						else v0 = value.toString();

						if (b.toJSON) v1 = b.toJSON();
						else v1 = value.toString();
						return v0 == v1;
					} else return false;
				},
				structure: eq.true,
				diff: function(a, b) {
					if (a.toString() == b.toString()) return {
						result: eq.STRICT,
						value: b.toString()
					};

					if (a.toJSON || b.toJSON) {
						var v0, v1;
						if (a.toJSON) v0 = a.toJSON();
						else v0 = value.toString();

						if (b.toJSON) v1 = b.toJSON();
						else v1 = value.toString();

						if (v0 == v1) return {
							result: eq.LOOSE,
							from: a,
							to: b
						};
					}

					return {
						result: eq.NOT_EQUAL,
						from: a,
						to: b
					};
				}
			},
			"Null": {
				loose: function(a, b) {
					return !a == !b;
				},
			},
			"Undefined": {
				loose: function(a, b) {
					return !a == !b;
				},
			},
			"Array": {
				strict: function(a, b) {
					return a == b;
				},
				loose: function(a, b) {
					return a.toString() == b.toString();
				},
				structure: eq.true
			},
			"Object": {
				strict: function(a, b) {
					return a.toString() == b.toString();
				},
				loose: function(a, b) {
					return a.toString() == b.toString();
				},
				structure: eq.false,
			},
			"Function": {
				strict: function(a, b) {
					return a.toString() == b.toString();
				},
				loose: function(a, b) {
					return a.toString() == b.toString();
				},
				structure: eq.true,
			}
		},
		"RegExp": {
			// ввести сравнение регулярок с json версией mongoosejs
			"RegExp": {
				strict: function(a, b) {
					if (a === b) return true;
				},
				loose: function(a, b) {
					return a.toString() == b.toString();
				},
				structure: eq.true,
				diff: eq.diffString
			},
			"Undefined": {
				loose: function(a, b) {
					if (a instanceof RegExp)
						return a.test(b);
					else
						return b.test(a);

				}
			},
			"Null": {
				loose: function(a, b) {
					if (a instanceof RegExp) {
						return a.test(b);
					} else
						return b.test(a);
				},
			},
			"Object": {
				strict: function(a, b) {
					return a.toString() == b.toString();
				},
				loose: function(a, b) {
					return a.toString() == b.toString();
				}
			},
		},
		"Date": {
			"Date": {
				strict: function(a, b) {
					if (a === b) return true;
					return a.toString() == b.toString();
				},
				loose: function(a, b) {
					return a.toString() == b.toString();
				},
				structure: eq.true
			},
			"Object": {
				strict: function(a, b) {
					return a.toString() == b.toString();
				},
				loose: function(a, b) {
					return a.toString() == b.toString();
				},
				structure: eq.false,
				diff: eq.diffString
			},
		},
		"Undefined": {
			"Undefined": {
				strict: eq.true,
				loose: eq.true,
				structure: eq.true,
				diff: function() {
					return {
						result: eq.STRICT,
					};
				}
			},
			"Null": {
				strict: eq.true,
				loose: eq.true,
				structure: eq.true,
				diff: function() {
					return {
						result: eq.STRICT,
						value: null
					};
				}
			}
		},
		"Null": {
			"Null": {
				strict: eq.true,
				loose: eq.true,
				structure: eq.true,
				diff: function() {
					return {
						result: eq.STRICT,
						value: null
					};
				}
			}
		},
		"Array": {
			"Array": {
				strict: eq.eqArray({
					strict: true
				}),
				loose: eq.eqArray({
					loose: true
				}),
				structure: eq.eqArray({
					structure: true
				}),
				diff: eq.eqArray({
					diff: true
				})
			},
			"Object": {
				strict: eq.eqObject({
					strict: true
				}),
				loose: eq.eqObject({
					loose: true
				}),
				structure: eq.eqObject({
					structure: true
				}),
				diff: eq.eqObject({
					diff: true
				})
			}
		},
		"Object": {
			"Object": {
				// возможно нужны будут Другие операции
				strict: eq.eqObject({
					strict: true
				}),
				loose: eq.eqObject({
					loose: true
				}),
				structure: eq.eqObject({
					structure: true
				}),
				diff: eq.eqObject({
					diff: true
				})
			},
		},
		"Function": {
			"Function": {
				strict: function(a, b) {
					return a === b;
				},
				loose: function(a, b) {
					return a.toString() == b.toString();
				},
				structure: eq.true,
				diff: eq.diffString
			}
		}
	};
};