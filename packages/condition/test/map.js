'use strict';

const assert = require('assert');
const map = require('../src/index').map;
const pMap = require('../src/index').pMap;

describe('# map', function() {

    it('should recursively map a condition based on a predicate', () => {
        const predicate = c => c.key ? ({ ...c, key: 'bar' }) : c;

        const condition = { operator: 'or', value: [
            { key: 'foo', operator: 'eq', value: 1 },
            { key: 'bar', operator: 'eq', value: 1 },
            { key: 'foo', operator: 'eq', value: 3 },
        ] };

        const mapped = { operator: 'or', value: [
            { key: 'bar', operator: 'eq', value: 1 },
            { key: 'bar', operator: 'eq', value: 1 },
            { key: 'bar', operator: 'eq', value: 3 },
        ] };

        assert.deepEqual(map(condition, predicate), mapped);
    });

    describe('# pMap', function() {

        it('should recursively map a condition based on a predicate that returns a promise', async () => {
            const predicate = c => Promise.resolve(c.key ? ({ ...c, key: 'bar' }) : c);

            const condition = {
                operator: 'or', value: [
                    { key: 'foo', operator: 'eq', value: 1 },
                    { key: 'bar', operator: 'eq', value: 1 },
                    { key: 'foo', operator: 'eq', value: 3 },
                ]
            };

            const mapped = {
                operator: 'or', value: [
                    { key: 'bar', operator: 'eq', value: 1 },
                    { key: 'bar', operator: 'eq', value: 1 },
                    { key: 'bar', operator: 'eq', value: 3 },
                ]
            };

            const result = await pMap(condition, predicate);

            assert.deepEqual(result, mapped);
        });
    });
});
