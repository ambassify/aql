'use strict';

const assert = require('assert');
const filter = require('../src/index').filter;

describe('# filter', function () {

    it('should recursively filter a condition based on a predicate', () => {
        const predicate = c => c.key === 'foo';

        const condition = { operator: 'or', value: [
            { key: 'foo', operator: 'eq', value: 1 },
            { key: 'bar', operator: 'eq', value: 1 },
            { key: 'foo', operator: 'eq', value: 3 },
        ] };

        const filtered = { operator: 'or', value: [
            { key: 'foo', operator: 'eq', value: 1 },
            { key: 'foo', operator: 'eq', value: 3 },
        ] };

        assert.deepEqual(filter(condition, predicate), filtered);
    });

    it('should also normalize complex conditions', () => {
        const predicate = c => c.key === 'foo';

        const condition = { operator: 'or', value: [
            { key: 'foo', operator: 'eq', value: 1 },
            { key: 'bar', operator: 'eq', value: 2 },
            { key: 'foo', operator: 'eq', value: 3 },
            { operator: 'or', value: [
                { key: 'foo', operator: 'eq', value: 4 },
            ] },
            {
                operator: 'not',
                value: { key: 'bar', operator: 'eq', value: 5 },
            },
            { operator: 'and', value: [
                { key: 'bar', operator: 'eq', value: 6 },
                { key: 'foo', operator: 'eq', value: 7 },
            ] },
        ] };

        const filtered = { operator: 'or', value: [
            { key: 'foo', operator: 'eq', value: 1 },
            { key: 'foo', operator: 'eq', value: 3 },
            { key: 'foo', operator: 'eq', value: 4 },
            { key: 'foo', operator: 'eq', value: 7 },
        ] };

        assert.deepEqual(filter(condition, predicate), filtered);
    });
});
