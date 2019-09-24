'use strict';

const assert = require('assert');
const serializeOrder = require('../src/order');

describe('# order', function () {

    it('should export ASC constant', () => {
        assert.equal(serializeOrder.ASC, 'asc');
    })

    it('should export DESC constant', () => {
        assert.equal(serializeOrder.DESC, 'desc');
    })

    it('should be able to serialize simple order objects', () => {
        assert.equal(serializeOrder([
            { key: 'foo', direction: 'asc' }
        ]), 'foo');
    });

    it('should be able to serialize descending order objects', () => {
        assert.equal(serializeOrder([
            { key: 'foo', direction: 'desc' }
        ]), '-foo');
    });

    it('should be able to serialize complex order objects', () => {
        assert.equal(serializeOrder([
            { key: 'foo', direction: 'desc' },
            { key: 'bar', direction: 'asc' },
            { key: 'foo.bar', direction: 'asc' },
            { key: 'one', direction: 'asc' },
            { key: 'two', direction: 'desc' },
        ]), '-foo,bar,foo.bar,one,-two');
    });

    it('should ignore invalid order objects', () => {
        assert.equal(serializeOrder(), undefined);
        assert.equal(serializeOrder(null), undefined);
        assert.equal(serializeOrder(false), undefined);
        assert.equal(serializeOrder(''), undefined);
        assert.equal(serializeOrder([]), undefined);
        assert.equal(serializeOrder([ { foo: 1 }]), undefined);
    });

});
