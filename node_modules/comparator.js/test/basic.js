var index = process.env['COVERAGE'] ? '../index-cov.js' : '../';
var inspect = require('util').inspect;

var assert = require('assert');
var comarator = require('./../index.js');

var strictEq = comarator.strictEq;
var looseEq = comarator.looseEq;
var structureEq = comarator.structureEq;
var diff = comarator.diff;
var fold = comarator.fold;
var unfold = comarator.unfold;

describe('Comparator', function() {
	it('works', function() {

	});

	it('strict', function() {
		function s() {}
		//structure + data
		assert.equal(strictEq(1, 1), true);
		assert.equal(strictEq(2, 1), false);
		assert.equal(strictEq(null, 1), false);
		assert.equal(strictEq(1, undefined),false);
		assert.equal(strictEq(function(){}, function(){}), false);
		assert.equal(strictEq(s, s), true);
		assert.equal(strictEq(/undefined/, undefined), false);
		assert.equal(strictEq(/null/, null), false);
		assert.equal(strictEq({a:1}, {a:1}), true);
		assert.equal(strictEq({a:1}, {a:1, b:1}), false);
		assert.equal(strictEq({b:1, a:[1,3]}, {a:[1,3], b:1}), false);
		assert.equal(strictEq([1,3],[1,3]), true);
		assert.equal(strictEq([1,3],[1,3,2]), false);
		assert.equal(strictEq({b:1, a:[{d:1},3]}, {a:[3,{d:2}], b:1}), false);

	});

	it('loose', function() {
		//identical data at least as source
		assert.equal(looseEq(function(){}, function(){}), true);
		assert.equal(looseEq(/undefined/, undefined), true);
		assert.equal(looseEq(/null/, null), true);
		assert.equal(looseEq(true, 'true'), true);
		assert.equal(looseEq(true, 'True'), true);
		assert.equal(looseEq('true', true), true);
		assert.equal(looseEq('True', true), true);
		assert.equal(looseEq(false, 'false'), true);
		assert.equal(looseEq(false, 'False'), true);
		assert.equal(looseEq('false', false), true);
		assert.equal(looseEq('False', false), true);
		assert.equal(looseEq(true, '1'), true);
		assert.equal(looseEq('1', true), true);

		assert.equal(looseEq({a:1}, {a:1, b:1}), true);
		assert.equal(looseEq({a:1, b:1}, {a:1}), false);
		assert.equal(looseEq({b:1, a:1}, {a:1, b:1}), true);
		assert.equal(looseEq({b:1, a:[1,3]}, {a:[1,3], b:1}), true);
		assert.equal(looseEq({b:1, a:[{d:1},3]}, {a:[3,{d:1}], b:1}), true);
		assert.equal(looseEq([1,3],[1,3]), true);
		assert.equal(looseEq([1,3],[1,3,2]), true);
		assert.equal(looseEq({b:1, a:[{d:1},3]}, {a:[3,{d:2}], b:1}), false);

	});

	it('structure', function() {
		assert.equal(structureEq({b:1, a:[{d:1},3]}, {a:[3,{d:1}], b:1}), false);
		assert.equal(structureEq({b:1, a:[1,3]}, {a:[1,3], b:1}), true);
		assert.equal(structureEq({a:1}, {a:1, b:1}), true);
		assert.equal(structureEq({a:1, b:[1,2]}, {a:1}), false);
		assert.equal(structureEq({b:[1,2], a:1}, {a:10, b:100}), false);
		assert.equal(structureEq({b:1, a:1}, {a:10, b:100}), true);
		assert.equal(structureEq([1,13],[1,323]), true);
		assert.equal(structureEq([1,3],[1,32,11]), false);
		assert.equal(structureEq([1,3, 1],[1,3,{a:1}]), false);
		assert.equal(structureEq({b:1, a:[{d:1},3]}, {a:[3,{d:2}], b:1}), false);
		assert.equal(structureEq({b:1, a:[{d:1},3]}, {a:[{d:2},3], b:1}), true);

	});

	it('diff', function() {
		function diffEqual(source, dest){
			assert.ok(looseEq(source, dest));
		}
		diffEqual(diff({b:1, a:3}, {a:3, b:1}),{
			a:{
				order:{from:1, to:0},
				value:{
					result:1,
					value:3
				}
			},
			b:{
				order:{from:0, to:1},
				value:{
					result:1,
					value:1
				}
			},
			reorder:true,
			result:1
		});

		diffEqual(diff([{d:1},3],[3,{d:1}]),
			{
				"0": {
					"order": {
						"from": 0,
						"to": 1
					},
					"value": {
						"result": 1,
						"d": {
							"result": 1,
							"value": 1
						}
					}
				},
				"1": {
					"order": {
						"from": 1,
						"to": 0
					},
					"value": {
						"result": 1,
						"value": 3
					}
				},
				"result": 1,
				"reorder": true
			});

		diffEqual(diff({b:1, a:[{d:1},3]}, {a:[3,{d:1}], b:1}), {
			"result": 1,
			"reorder": true,
			"a": {
				"order": {
					"from": 1,
					"to": 0
				},
				"value": {
					"0": {
						"order": {
							"from": 0,
							"to": 1
						},
						"value": {
							"result": 1,
							"d": {
								"result": 1,
								"value": 1
							}
						}
					},
					"1": {
						"order": {
							"from": 1,
							"to": 0
						},
						"value": {
							"result": 1,
							"value": 3
						}
					},
					"result": 1,
					"reorder": true
				}
			},
			"b": {
				"order": {
					"from": 0,
					"to": 1
				},
				"value": {
					"result": 1,
					"value": 1
				}
			}
		});
		diffEqual(diff({b:1, a:[{d:1},3]}, {a:[3,{d:1}], b:1}),{
			"result": 1,
			"reorder": true,
			"a": {
				"order": {
					"from": 1,
					"to": 0
				},
				"value": {
					"0": {
						"order": {
							"from": 0,
							"to": 1
						},
						"value": {
							"result": 1,
							"d": {
								"result": 1,
								"value": 1
							}
						}
					},
					"1": {
						"order": {
							"from": 1,
							"to": 0
						},
						"value": {
							"result": 1,
							"value": 3
						}
					},
					"result": 1,
					"reorder": true
				}
			},
			"b": {
				"order": {
					"from": 0,
					"to": 1
				},
				"value": {
					"result": 1,
					"value": 1
				}
			}
		});

		var v = diff({b:1, a:[{d:1},3]}, {a:[3,{d:2}], b:1});
		diffEqual(v, {
			result: 3,
	  	reorder: true,
		  a: { 
		  		order: { from: 1, to: 0 },
		    	value: { 
		    		'0': {	
		    				order: { from: 0, to: 1 },
		          	value: { 
		          		result: 3,
		          		d: { result: 3,	from: 1, to: 2 } 
		         		} 
		        },
		        '1': { 
		        	order: { from: 1, to: 0 },
		        	value: { result: 1, value: 3 }
		        },
		        result: 3,
		        reorder: true 
		    } 
		  },
		  b: { 
		  	order: { from: 0, to: 1 },
		  	value: { result: 1, value: 1 } 
		  } 
	  }
  );

		diffEqual(diff([1, 2, 3], [1, 2, 3]), {
			result: 1,
			value: [1, 2, 3]
		});
		diffEqual(diff([1, 2, 3], [1, 2, 2]), {
			"0": {
				"value": {
					"result": 1,
					"value": 1
				}
			},
			"1": {
				"value": {
					"result": 1,
					"value": 2
				}
			},
			"result": 0,
			"reorder": true,
			"removed": {
				"2": {
					"order": -1,
					"value": 3
				}
			},
			"inserted": {
				"2": {
					"order": 2,
					"value": 2
				}
			}
		});
	});
	
	it('fold/unfold', function(){
		var obj = {
			_id: 123456,
			name: 'name',
			summary: {
				_id: 123,
				item: [1, 2, {
						name: 1,
						just: 111,
						some: [11122, [11, 11]]
					},
					4
				]
			}
		};
		var unfolded = {
			"_id": 123456,
			"name": "name",
			"summary._id": 123,
			"summary.item.0": 1,
			"summary.item.1": 2,
			"summary.item.2.name": 1,
			"summary.item.2.just": 111,
			"summary.item.2.some.0": 11122,
			"summary.item.2.some.1.0": 11,
			"summary.item.2.some.1.1": 11,
			"summary.item.3": 4
		};
		
		var res = unfold(obj);
		var res1 = fold(res);
		assert.equal(strictEq(res, unfolded), true);
		assert.equal(strictEq(res1, obj), true);

	});
});