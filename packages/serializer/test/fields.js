'use strict';

const assert = require('assert');
const serializeFields = require('../src/fields');

describe('# fields', function() {

    it('should be able to serialize simple field objects', () => {
        assert.equal(serializeFields({
            foo: true,
            bar: true,
            baz: true,
        }), 'foo,bar,baz');
    });

    it('should be able to serialize empty values', () => {
        assert.equal(serializeFields(), undefined);
        assert.equal(serializeFields(null), undefined);
        assert.equal(serializeFields(false), undefined);
        assert.equal(serializeFields(''), undefined);
        assert.equal(serializeFields({}), undefined);
    });

    it('should be able to serialize nested field objects', () => {
        assert.equal(serializeFields({
            foo: true,
            bar: { one: true, two: true },
            baz: { one: true }
        }), 'foo,bar(one,two),baz(one)');
    });

    it('should exclude falsy values in fields object', () => {
        assert.equal(serializeFields({
            foo: true,
            bar: false,
            baz: null,
        }), 'foo');
    });

    it('should be able to serialize deeply nested field objects', () => {
        assert.equal(serializeFields({
            foo: {
                bar: {
                    baz: {
                        one: true,
                        two: {
                            three: true,
                            four: true,
                        }
                    }
                }
            },
        }), 'foo(bar(baz(one,two(three,four))))');
    });

    it('should leave strings alone', () => {
        assert.equal(serializeFields('foo;bar'), 'foo;bar');
    })

});
