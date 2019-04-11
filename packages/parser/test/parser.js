'use strict';

const assert = require('assert');
const parseFields = require('../src/fields');

describe('# fields', function () {

    it('should be able to parse simple field strings', () => {
        assert.deepEqual(parseFields('foo,bar,baz'), {
            foo: true,
            bar: true,
            baz: true,
        });
    });

    it('should be able to parse field string with single field', () => {
        assert.deepEqual(parseFields('foo'), { foo: true });
    });

    it('should be able to parse empty field strings', () => {
        assert.deepEqual(parseFields(), {});
        assert.deepEqual(parseFields(null), {});
        assert.deepEqual(parseFields(false), {});
        assert.deepEqual(parseFields(''), {});
    });

    it('should be able to parse nested field strings', () => {
        assert.deepEqual(parseFields('foo,bar(one,two),baz(one)'), {
            foo: true,
            bar: { one: true, two: true },
            baz: { one: true }
        });
    });

    it('should be able to parse deeply nested field strings', () => {
        assert.deepEqual(parseFields('foo(bar(baz(one,two(three,four))))'), {
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
        });
    });

    it('should throw an error when invalid input is passed', () => {
        assert.throws(() => parseFields(true));
        assert.throws(() => parseFields({}));
        assert.throws(() => parseFields('foo,'));
        assert.throws(() => parseFields('foo('));
        assert.throws(() => parseFields('foo())'));
    });

    it('should tolerate spaces', () => {
        assert.deepEqual(parseFields('  foo   , bar, baz (  one, two   )'), {
            foo: true,
            bar: true,
            baz: { one: true, two: true },
        });
    });

});
