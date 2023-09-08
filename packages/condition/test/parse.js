'use strict';

const assert = require('assert');
const parse = require('../src/index').parse;

describe('# parse', function() {

    it('should expose the AQL condition parser', () => {
        const condition = { operator: 'or', value: [
            { key: 'foo', operator: 'eq', value: 1 },
            { key: 'bar', operator: 'eq', value: 1 },
            { key: 'foo', operator: 'eq', value: 3 },
        ] };

        const str = encodeURIComponent(JSON.stringify(condition));

        assert.deepEqual(parse(str), condition);
    });

    it('should also normalize complex conditions', () => {
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

        const normalized = { operator: 'or', value: [
            { key: 'foo', operator: 'eq', value: 1 },
            { key: 'bar', operator: 'eq', value: 2 },
            { key: 'foo', operator: 'eq', value: 3 },
            { key: 'foo', operator: 'eq', value: 4 },
            {
                operator: 'not',
                value: { key: 'bar', operator: 'eq', value: 5 },
            },
            { operator: 'and', value: [
                { key: 'bar', operator: 'eq', value: 6 },
                { key: 'foo', operator: 'eq', value: 7 },
            ] },
        ] };

        const str = encodeURIComponent(JSON.stringify(condition));

        assert.deepEqual(parse(str), normalized);
    });
});
