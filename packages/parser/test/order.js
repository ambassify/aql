'use strict';

const assert = require('assert');
const parseOrder = require('../src/order');

describe('# order', function() {

    it('should export ASC constant', () => {
        assert.equal(parseOrder.ASC, 'asc');
    })

    it('should export DESC constant', () => {
        assert.equal(parseOrder.DESC, 'desc');
    })

    it('should be able to parse simple order strings', () => {
        assert.deepEqual(parseOrder('foo'), [
            { key: 'foo', direction: 'asc' }
        ]);
    });

    it('should be able to parse explicitly ascending order strings', () => {
        assert.deepEqual(parseOrder('+foo'), [
            { key: 'foo', direction: 'asc' }
        ]);
    });

    it('should be able to parse descending order strings', () => {
        assert.deepEqual(parseOrder('-foo'), [
            { key: 'foo', direction: 'desc' }
        ]);
    });

    it('should be able to parse complex order strings', () => {
        assert.deepEqual(parseOrder('-foo,bar,+foo.bar,one,-two'), [
            { key: 'foo', direction: 'desc' },
            { key: 'bar', direction: 'asc' },
            { key: 'foo.bar', direction: 'asc' },
            { key: 'one', direction: 'asc' },
            { key: 'two', direction: 'desc' },
        ]);
    });

    it('should be able to parse empty order strings', () => {
        assert.deepEqual(parseOrder(), []);
        assert.deepEqual(parseOrder(null), []);
        assert.deepEqual(parseOrder(false), []);
        assert.deepEqual(parseOrder(''), []);
    });

});
