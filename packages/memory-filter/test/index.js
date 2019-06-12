'use strict';

const assert = require('assert');
const filter = require('../src/index');

describe('# memory-filter', function () {

    it('should throw error when unknown operators are used', () => {
        assert.throws(() => filter([ 1 ], { operator: 'foo' }));
    })

    it('should leave dataset intact when condition is "empty"', () => {
        const dataset = [ 1, 2, 3 ];
        assert.deepEqual(filter(dataset), dataset);
        assert.deepEqual(filter(dataset, {}), dataset);
        assert.deepEqual(filter(dataset, { foo: 1 }), dataset);
    })

    it('should filter a dataset', () => {
        const dataset = [
            { type: 'foo' },
            { type: 'bar' },
            { type: 'baz' },
        ];

        const expected = [
            { type: 'bar' },
            { type: 'baz' },
        ];

        const result = filter(dataset, {
            key: 'type',
            operator: 'startsWith',
            value: 'ba'
        });

        assert.deepEqual(result, expected);
    })

    describe('# and', () => {
        it('should pass when all subconditions match', () => {
            assert(filter.test({ id: 1, type: 2 }, {
                operator: 'and',
                value: [
                    { key: 'id', operator: 'eq', value: 1 },
                    { key: 'type', operator: 'eq', value: 2 },
                ]
            }));
        })

        it('should fail when at least one subcondition does not match', () => {
            assert(!filter.test({ id: 1, type: 2 }, {
                operator: 'and',
                value: [
                    { key: 'id', operator: 'eq', value: 1 },
                    { key: 'type', operator: 'eq', value: 1 },
                ]
            }));
        })
    })

    describe('# or', () => {
        it('should pass when all subconditions match', () => {
            assert(filter.test({ id: 1, type: 2 }, {
                operator: 'or',
                value: [
                    { key: 'id', operator: 'eq', value: 1 },
                    { key: 'type', operator: 'eq', value: 2 },
                ]
            }));
        })

        it('should pass when at least one subcondition matches', () => {
            assert(filter.test({ id: 1, type: 2 }, {
                operator: 'or',
                value: [
                    { key: 'id', operator: 'eq', value: 1 },
                    { key: 'type', operator: 'eq', value: 1 },
                ]
            }));
        })

        it('should fail when none of the subcondition match', () => {
            assert(!filter.test({ id: 1, type: 2 }, {
                operator: 'or',
                value: [
                    { key: 'id', operator: 'eq', value: 2 },
                    { key: 'type', operator: 'eq', value: 1 },
                ]
            }));
        })
    })

    describe('# not', () => {
        it('should fail when the subcondition matches', () => {
            assert(!filter.test({ id: 1, type: 2 }, {
                operator: 'not',
                value: { key: 'id', operator: 'eq', value: 1 },
            }));
        })

        it('should pass when the subcondition does not match', () => {
            assert(filter.test({ id: 1, type: 2 }, {
                operator: 'not',
                value: { key: 'id', operator: 'eq', value: 2 },
            }));
        })
    })

    describe('# (un)known', () => {
        it('should consider `undefined` to be unknown', () => {
            assert(filter.test({}, { key: 'foo', operator: 'unknown' }));
            assert(!filter.test({}, { key: 'foo', operator: 'known' }));
            assert(filter.test({ foo: undefined }, { key: 'foo', operator: 'unknown' }));
            assert(!filter.test({ foo: undefined }, { key: 'foo', operator: 'known' }));
        })

        it('should consider `null` to be unknown', () => {
            assert(filter.test({ foo: null }, { key: 'foo', operator: 'unknown' }));
            assert(!filter.test({ foo: null }, { key: 'foo', operator: 'known' }));
        })

        it('should consider other (falsy/empty) values to be known', () => {
            assert(!filter.test({ foo: false }, { key: 'foo', operator: 'unknown' }));
            assert(filter.test({ foo: false }, { key: 'foo', operator: 'known' }));
            assert(!filter.test({ foo: 0 }, { key: 'foo', operator: 'unknown' }));
            assert(filter.test({ foo: 0 }, { key: 'foo', operator: 'known' }));
            assert(!filter.test({ foo: [] }, { key: 'foo', operator: 'unknown' }));
            assert(filter.test({ foo: [] }, { key: 'foo', operator: 'known' }));
            assert(!filter.test({ foo: '' }, { key: 'foo', operator: 'unknown' }));
            assert(filter.test({ foo: '' }, { key: 'foo', operator: 'known' }));
            assert(!filter.test({ foo: 'yo' }, { key: 'foo', operator: 'unknown' }));
            assert(filter.test({ foo: 'yo' }, { key: 'foo', operator: 'known' }));
        })
    })

    describe('# (n)eq', () => {
        it('should check equality', () => {
            assert(filter.test({ foo: 0 }, { key: 'foo', operator: 'eq', value: 0 }));
            assert(!filter.test({ foo: 0 }, { key: 'foo', operator: 'neq', value: 0 }));
            assert(filter.test({ foo: true }, { key: 'foo', operator: 'eq', value: true }));
            assert(!filter.test({ foo: true }, { key: 'foo', operator: 'neq', value: true }));
            assert(filter.test({ foo: 'bar' }, { key: 'foo', operator: 'eq', value: 'bar' }));
            assert(!filter.test({ foo: 'bar' }, { key: 'foo', operator: 'neq', value: 'bar' }));
            assert(filter.test({ foo: [ 'bar', 'baz' ] }, { key: 'foo', operator: 'eq', value: [ 'bar', 'baz' ] }));
            assert(!filter.test({ foo: [ 'bar', 'baz' ] }, { key: 'foo', operator: 'neq', value: [ 'bar', 'baz' ] }));
            assert(filter.test({ foo: { bar: 'baz'} }, { key: 'foo', operator: 'eq', value: { bar: 'baz'} }));
            assert(!filter.test({ foo: { bar: 'baz'} }, { key: 'foo', operator: 'neq', value: { bar: 'baz'} }));
        })

        it('should be case-insensitive when condition value is a string', () => {
            assert(filter.test({ foo: 'BaR' }, { key: 'foo', operator: 'eq', value: 'bar' }));
            assert(!filter.test({ foo: 'BaR' }, { key: 'foo', operator: 'neq', value: 'bar' }));
        })

        it('should require array-order to match', () => {
            assert(!filter.test({ foo: [ 1, 2 ] }, { key: 'foo', operator: 'eq', value: [ 2, 1 ] }));
            assert(filter.test({ foo: [ 1, 2 ] }, { key: 'foo', operator: 'neq', value: [ 2, 1 ] }));
        })
    })

    describe('# gt/lt', () => {
        it('should work with numbers', () => {
            assert(filter.test({ foo: 5 }, { key: 'foo', operator: 'gt', value: 3 }));
            assert(!filter.test({ foo: 5 }, { key: 'foo', operator: 'lt', value: 3 }));
            assert(!filter.test({ foo: 3 }, { key: 'foo', operator: 'gt', value: 5 }));
            assert(filter.test({ foo: 3 }, { key: 'foo', operator: 'lt', value: 5 }));
        })

        it('should work with strings (lexical compare)', () => {
            assert(filter.test({ foo: 'c' }, { key: 'foo', operator: 'gt', value: 'a' }));
            assert(!filter.test({ foo: 'c' }, { key: 'foo', operator: 'lt', value: 'a' }));
            assert(!filter.test({ foo: 'a' }, { key: 'foo', operator: 'gt', value: 'c' }));
            assert(filter.test({ foo: 'a' }, { key: 'foo', operator: 'lt', value: 'c' }));
        })

        it('should work with dates', () => {
            const today = new Date();
            const tomorrow = new Date(Date.now() + (24 * 3600 * 1000));

            assert(filter.test({ foo: tomorrow }, { key: 'foo', operator: 'gt', value: today }));
            assert(!filter.test({ foo: tomorrow }, { key: 'foo', operator: 'lt', value: today }));
            assert(!filter.test({ foo: today }, { key: 'foo', operator: 'gt', value: tomorrow }));
            assert(filter.test({ foo: today }, { key: 'foo', operator: 'lt', value: tomorrow }));
        })
    })

    describe('# gte/lte', () => {
        it('should work with numbers', () => {
            assert(filter.test({ foo: 5 }, { key: 'foo', operator: 'gte', value: 3 }));
            assert(!filter.test({ foo: 5 }, { key: 'foo', operator: 'lte', value: 3 }));
            assert(!filter.test({ foo: 3 }, { key: 'foo', operator: 'gte', value: 5 }));
            assert(filter.test({ foo: 3 }, { key: 'foo', operator: 'lte', value: 5 }));
            assert(filter.test({ foo: 3 }, { key: 'foo', operator: 'gte', value: 3 }));
            assert(filter.test({ foo: 3 }, { key: 'foo', operator: 'lte', value: 3 }));
        })

        it('should work with strings (lexical compare)', () => {
            assert(filter.test({ foo: 'c' }, { key: 'foo', operator: 'gte', value: 'a' }));
            assert(!filter.test({ foo: 'c' }, { key: 'foo', operator: 'lte', value: 'a' }));
            assert(!filter.test({ foo: 'a' }, { key: 'foo', operator: 'gte', value: 'c' }));
            assert(filter.test({ foo: 'a' }, { key: 'foo', operator: 'lte', value: 'c' }));
            assert(filter.test({ foo: 'a' }, { key: 'foo', operator: 'gte', value: 'a' }));
            assert(filter.test({ foo: 'a' }, { key: 'foo', operator: 'lte', value: 'a' }));
        })

        it('should work with dates', () => {
            const today = new Date();
            const tomorrow = new Date(Date.now() + (24 * 3600 * 1000));

            assert(filter.test({ foo: tomorrow }, { key: 'foo', operator: 'gte', value: today }));
            assert(!filter.test({ foo: tomorrow }, { key: 'foo', operator: 'lte', value: today }));
            assert(!filter.test({ foo: today }, { key: 'foo', operator: 'gte', value: tomorrow }));
            assert(filter.test({ foo: today }, { key: 'foo', operator: 'lte', value: tomorrow }));
            assert(filter.test({ foo: today }, { key: 'foo', operator: 'gte', value: today }));
            assert(filter.test({ foo: today }, { key: 'foo', operator: 'lte', value: today }));
        })
    })

    describe('# between', () => {
        it('should work with numbers and be inclusive of the edges', () => {
            assert(!filter.test({ foo: 2 }, { key: 'foo', operator: 'between', value: [ 3, 5 ] }));
            assert(filter.test({ foo: 3 }, { key: 'foo', operator: 'between', value: [ 3, 5 ] }));
            assert(filter.test({ foo: 4 }, { key: 'foo', operator: 'between', value: [ 3, 5 ] }));
            assert(filter.test({ foo: 5 }, { key: 'foo', operator: 'between', value: [ 3, 5 ] }));
            assert(!filter.test({ foo: 6 }, { key: 'foo', operator: 'between', value: [ 3, 5 ] }));
        })

        it('should work with strings (lexical compare)', () => {
            assert(!filter.test({ foo: 'a' }, { key: 'foo', operator: 'between', value: ['b', 'd'] }));
            assert(filter.test({ foo: 'b' }, { key: 'foo', operator: 'between', value: ['b', 'd'] }));
            assert(filter.test({ foo: 'c' }, { key: 'foo', operator: 'between', value: ['b', 'd'] }));
            assert(filter.test({ foo: 'd' }, { key: 'foo', operator: 'between', value: ['b', 'd'] }));
            assert(!filter.test({ foo: 'e' }, { key: 'foo', operator: 'between', value: ['b', 'd'] }));
        })

        it('should work with dates', () => {
            const now = Date.now();
            const a = new Date(now - 2);
            const b = new Date(now - 1);
            const c = new Date(now);
            const d = new Date(now + 1);
            const e = new Date(now + 2);

            assert(!filter.test({ foo: a }, { key: 'foo', operator: 'between', value: [b, d] }));
            assert(filter.test({ foo: b }, { key: 'foo', operator: 'between', value: [b, d] }));
            assert(filter.test({ foo: c }, { key: 'foo', operator: 'between', value: [b, d] }));
            assert(filter.test({ foo: d }, { key: 'foo', operator: 'between', value: [b, d] }));
            assert(!filter.test({ foo: e }, { key: 'foo', operator: 'between', value: [b, d] }));
        })
    })

    describe('# in', () => {
        it('should pass when item value is included in condition value', () => {
            assert(filter.test({ foo: 1 }, { key: 'foo', operator: 'in', value: [ 1, 2, 3 ] }));
            assert(filter.test({ foo: 'a' }, { key: 'foo', operator: 'in', value: 'abc' }));
        })

        it('should fail when item value is not included in condition value', () => {
            assert(!filter.test({ foo: 5 }, { key: 'foo', operator: 'in', value: [ 1, 2, 3 ] }));
            assert(!filter.test({ foo: 'e' }, { key: 'foo', operator: 'in', value: 'abc' }));
        })
    })

    describe('# startsWith', () => {
        it('should pass when item value starts with condition value', () => {
            assert(filter.test({ foo: 'bar' }, { key: 'foo', operator: 'startsWith', value: 'b' }));
            assert(filter.test({ foo: 'bar' }, { key: 'foo', operator: 'startsWith', value: 'ba' }));
            assert(filter.test({ foo: 'bar' }, { key: 'foo', operator: 'startsWith', value: 'bar' }));
        })

        it('should fail when item value does not start with condition value', () => {
            assert(!filter.test({ foo: 'bar' }, { key: 'foo', operator: 'startsWith', value: 'fo' }));
        })

        it('should be case-insensitive', () => {
            assert(filter.test({ foo: 'Bar' }, { key: 'foo', operator: 'startsWith', value: 'ba' }));
        })
    })

    describe('# endsWith', () => {
        it('should pass when item value ends with condition value', () => {
            assert(filter.test({ foo: 'bar' }, { key: 'foo', operator: 'endsWith', value: 'r' }));
            assert(filter.test({ foo: 'bar' }, { key: 'foo', operator: 'endsWith', value: 'ar' }));
            assert(filter.test({ foo: 'bar' }, { key: 'foo', operator: 'endsWith', value: 'bar' }));
        })

        it('should fail when item value does not end with condition value', () => {
            assert(!filter.test({ foo: 'bar' }, { key: 'foo', operator: 'endsWith', value: 'oo' }));
        })

        it('should be case-insensitive', () => {
            assert(filter.test({ foo: 'Bar' }, { key: 'foo', operator: 'endsWith', value: 'ar' }));
        })
    })

    describe('# contains', () => {
        it('should pass when item value contains condition value', () => {
            assert(filter.test({ foo: 'foobar' }, { key: 'foo', operator: 'contains', value: 'oba' }));
            assert(filter.test({ foo: 'foobar' }, { key: 'foo', operator: 'contains', value: 'obar' }));
            assert(filter.test({ foo: 'foobar' }, { key: 'foo', operator: 'contains', value: 'foo' }));
            assert(filter.test({ foo: 'foobar' }, { key: 'foo', operator: 'contains', value: 'foobar' }));
        })

        it('should fail when item value does not contain condition value', () => {
            assert(!filter.test({ foo: 'foobar' }, { key: 'foo', operator: 'contains', value: 'bla' }));
        })

        it('should be case-insensitive', () => {
            assert(filter.test({ foo: 'FoObAr' }, { key: 'foo', operator: 'contains', value: 'ba' }));
        })
    })

    describe('# match', () => {
        it('should run regular expressions test against item value', () => {
            assert(filter.test({ foo: 'foobar' }, { key: 'foo', operator: 'match', value: '^foo' }));
            assert(filter.test({ foo: 'foobar' }, { key: 'foo', operator: 'match', value: 'bar$' }));
            assert(filter.test({ foo: 'foobar' }, { key: 'foo', operator: 'match', value: '^[fobar]+$' }));
            assert(filter.test({ foo: 'foobar' }, { key: 'foo', operator: 'match', value: '\\w+' }));
            assert(!filter.test({ foo: 'foobar' }, { key: 'foo', operator: 'match', value: '^bar' }));
            assert(!filter.test({ foo: 'foobar' }, { key: 'foo', operator: 'match', value: '\\d+' }));
        })

        it('should have support for flags when condition value is an array', () => {
            assert(!filter.test({ foo: 'FoObAr' }, { key: 'foo', operator: 'match', value: '^[fobar]+$' }));
            assert(filter.test({ foo: 'FoObAr' }, { key: 'foo', operator: 'match', value: [ '^[fobar]+$', 'i' ] }));
        })
    })

    describe('# noneOf', () => {
        it('should pass if none of the items in condition value are included in item value', () => {
            const item = { foo: [ 1, 2, 3, 4 ] };
            const cond = value => ({ key: 'foo', operator: 'noneOf', value });

            assert(filter.test(item, cond([])));
            assert(filter.test(item, cond([ 5 ])));
            assert(filter.test(item, cond([ 5, -1 ])));
            assert(!filter.test(item, cond([ 5, -1, 4 ])));
            assert(!filter.test(item, cond([ 4 ])));
        })
    })

    describe('# anyOf', () => {
        it('should pass if at least one of the items in condition value is included in item value', () => {
            const item = { foo: [ 1, 2, 3, 4 ] };
            const cond = value => ({ key: 'foo', operator: 'anyOf', value });

            assert(filter.test(item, cond([ 3 ])));
            assert(filter.test(item, cond([ 1, 2, 3, 4 ])));
            assert(filter.test(item, cond([ -1, 1023, 4, 9 ])));
            assert(!filter.test(item, cond([])));
            assert(!filter.test(item, cond([ -1 ])));
            assert(!filter.test(item, cond([ -1, 9, 100 ])));
        })
    })

    describe('# allOf', () => {
        it('should pass if all of the items in condition value are included in item value', () => {
            const item = { foo: [ 1, 2, 3, 4 ] };
            const cond = value => ({ key: 'foo', operator: 'allOf', value });

            assert(filter.test(item, cond([])));
            assert(filter.test(item, cond([ 1, 3 ])));
            assert(filter.test(item, cond([ 1, 2, 3, 4 ])));
            assert(!filter.test(item, cond([ -1 ])));
            assert(!filter.test(item, cond([ 1, -1 ])));
            assert(!filter.test(item, cond([ 1, 2, 3, 4, -1 ])));
            assert(!filter.test(item, cond([ -1, 9, 100 ])));
        })
    })

});
