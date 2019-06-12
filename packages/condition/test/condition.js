'use strict';

const assert = require('assert');
const Condition = require('../src/index');

describe('# condition', function () {

    it('.and should combine multiple conditions with `and` operator', () => {
        const a = { key: 'foo', operator: 'eq', value: 1 };
        const b = null;
        const c = {
            operator: 'and', value: [
                { key: 'foo', operator: 'eq', value: 2 },
                { key: 'bar', operator: 'eq', value: 3 },
                { key: 'foo', operator: 'eq', value: 4 },
            ]
        };

        const expected = { operator: 'and', value: [
            { key: 'foo', operator: 'eq', value: 1 },
            { key: 'foo', operator: 'eq', value: 2 },
            { key: 'bar', operator: 'eq', value: 3 },
            { key: 'foo', operator: 'eq', value: 4 },
        ] };

        assert.deepEqual(Condition.and(a, b, c), expected);
    });

    it('.or should combine multiple conditions with `or` operator', () => {
        const a = { key: 'foo', operator: 'eq', value: 1 };
        const b = null;
        const c = {
            operator: 'or', value: [
                { key: 'foo', operator: 'eq', value: 2 },
                { key: 'bar', operator: 'eq', value: 3 },
                { key: 'foo', operator: 'eq', value: 4 },
            ]
        };

        const expected = { operator: 'or', value: [
            { key: 'foo', operator: 'eq', value: 1 },
            { key: 'foo', operator: 'eq', value: 2 },
            { key: 'bar', operator: 'eq', value: 3 },
            { key: 'foo', operator: 'eq', value: 4 },
        ] };

        assert.deepEqual(Condition.or(a, b, c), expected);
    });

    it('.not should create a negation of condition', () => {
        const a = { key: 'foo', operator: 'eq', value: 1 };
        const b = { operator: 'not', value: a };

        assert.deepEqual(Condition.not(a), b);
        assert.deepEqual(Condition.not(b), a);
    });
});
