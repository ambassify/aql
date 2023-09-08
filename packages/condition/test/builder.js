'use strict';

const assert = require('assert');
const { camelCase } = require('lodash');
const Condition = require('../src/index');


describe('# builder', function() {

    it('should expose a method for every operator', () => {
        const ALL_OPERATORS = Object
            .keys(Condition.OPERATORS)
            .filter(k => k !== 'KEYLESS')
            .map(k => camelCase(k));

        ALL_OPERATORS.forEach(op => {
            assert(typeof Condition[op] === 'function', `${op} builder is defined`);
        });
    })

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

    it('.known should create a valueless condition', () => {
        const a = { key: 'foo', operator: 'known' };
        assert.deepEqual(Condition.known('foo'), a);
    });

    it('.eq should create a full condition', () => {
        const a = { key: 'foo', operator: 'eq', value: 'bar' };
        assert.deepEqual(Condition.eq('foo', 'bar'), a);
    });
});
