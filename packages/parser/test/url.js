'use strict';

const assert = require('assert');
const qs = require('qs');
const parseUrl = require('../src/url');
const parseFields = require('../src/fields');
const parseOrder = require('../src/order');

describe('# url', function() {

    it('should throw an error when invalid input is passed', () => {
        assert.throws(() => parseUrl(true));
        assert.throws(() => parseUrl({}));
    });

    it('should parse full URLs containing AQL components', () => {
        const condition = { operator: 'and', value: [] };
        const fields = 'foo,bar(baz,foo)';
        const order = 'foo,-bar';

        const url = [
            'https://foo.bar/?hello=world',
            `condition=${encodeURIComponent(JSON.stringify(condition))}`,
            `fields=${encodeURIComponent(fields)}`,
            `order=${encodeURIComponent(order)}`,
        ].join('&');

        const results = parseUrl(url);

        assert.deepEqual(results.condition, condition);
        assert.deepEqual(results.order, parseOrder(order));
        assert.deepEqual(results.fields, parseFields(fields));
    })

    it('should parse relative URLs containing AQL components', () => {
        const condition = { operator: 'and', value: [] };
        const fields = 'foo,bar(baz,foo)';
        const order = 'foo,-bar';

        const url = [
            '/hello?hello=world',
            `condition=${encodeURIComponent(JSON.stringify(condition))}`,
            `fields=${encodeURIComponent(fields)}`,
            `order=${encodeURIComponent(order)}`,
        ].join('&');

        const results = parseUrl(url);

        assert.deepEqual(results.condition, condition);
        assert.deepEqual(results.order, parseOrder(order));
        assert.deepEqual(results.fields, parseFields(fields));
    })

    it('should parse querystrings containing AQL components', () => {
        const condition = { operator: 'and', value: [] };
        const fields = 'foo,bar(baz,foo)';
        const order = 'foo,-bar';

        const url = [
            `condition=${encodeURIComponent(JSON.stringify(condition))}`,
            `fields=${encodeURIComponent(fields)}`,
            `order=${encodeURIComponent(order)}`,
        ].join('&');

        const results = parseUrl(url);

        assert.deepEqual(results.condition, condition);
        assert.deepEqual(results.order, parseOrder(order));
        assert.deepEqual(results.fields, parseFields(fields));
    })

    it('should allow you to define condition using nested query instead of JSON', () => {
        const condition = { operator: 'and', value: [
            { key: 'foo', operator: 'eq', value: 'bar' },
            { operator: 'or', value: [
                { key: 'bar', operator: 'eq', value: 'bar' },
                { key: 'baz', operator: 'neq', value: 'bar' },
            ] }
        ] };

        const query = qs.stringify({ condition });
        const results = parseUrl(query);

        assert.deepEqual(results.condition, condition);
    })

});
