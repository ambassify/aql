'use strict';

const assert = require('assert');
const normalize = require('../src/index').normalize;

describe('# normalize', function () {

    it('should filter out conditions that are always true (~= empty conditions)', () => {
        assert.equal(normalize(), null);
        assert.equal(normalize({}), null);
        assert.equal(normalize({ operator: 'and', value: [] }), null);
        assert.equal(normalize({ operator: 'and', value: [ null, null ] }), null);
        assert.equal(normalize({ operator: 'or', value: [] }), null);
        assert.equal(normalize({ operator: 'or', value: [ null, null ] }), null);
        assert.equal(normalize({ operator: 'not' }), null);
    });

    it('should hoist nested `and` conditions to the same level', () => {
        const condition = { operator: 'and', value: [
            { operator: 'and', value: [
                { operator: 'and', value: [
                    { key: '1.a', operator: 'eq', value: '1.a' },
                    { key: '1.b', operator: 'eq', value: '1.b' },
                ] },
                { key: '1.c', operator: 'eq', value: '1.c' },
            ] },
            { operator: 'or', value: [
                { operator: 'and', value: [
                    { key: '2.a', operator: 'eq', value: '2.a' },
                    { operator: 'and', value: [
                        { key: '2.b', operator: 'eq', value: '2.b' },
                        { key: '2.c', operator: 'eq', value: '2.c' },
                    ] }
                ] },
                { key: '3.a', operator: 'eq', value: '3.a' },
            ] }
        ] };

        const normalized = { operator: 'and', value: [
            { key: '1.a', operator: 'eq', value: '1.a' },
            { key: '1.b', operator: 'eq', value: '1.b' },
            { key: '1.c', operator: 'eq', value: '1.c' },
            { operator: 'or', value: [
                { operator: 'and', value: [
                    { key: '2.a', operator: 'eq', value: '2.a' },
                    { key: '2.b', operator: 'eq', value: '2.b' },
                    { key: '2.c', operator: 'eq', value: '2.c' },
                ] },
                { key: '3.a', operator: 'eq', value: '3.a' },
            ] }
        ] };

        assert.deepEqual(normalize(condition), normalized);
    })

    it('should hoist nested `or` conditions to the same level', () => {
        const condition = { operator: 'or', value: [
            { operator: 'or', value: [
                { operator: 'or', value: [
                    { key: '1.a', operator: 'eq', value: '1.a' },
                    { key: '1.b', operator: 'eq', value: '1.b' },
                ] },
                { key: '1.c', operator: 'eq', value: '1.c' },
            ] },
            { operator: 'and', value: [
                { operator: 'or', value: [
                    { key: '2.a', operator: 'eq', value: '2.a' },
                    { operator: 'or', value: [
                        { key: '2.b', operator: 'eq', value: '2.b' },
                        { key: '2.c', operator: 'eq', value: '2.c' },
                    ] }
                ] },
                { key: '3.a', operator: 'eq', value: '3.a' },
            ] }
        ] };

        const normalized = { operator: 'or', value: [
            { key: '1.a', operator: 'eq', value: '1.a' },
            { key: '1.b', operator: 'eq', value: '1.b' },
            { key: '1.c', operator: 'eq', value: '1.c' },
            { operator: 'and', value: [
                { operator: 'or', value: [
                    { key: '2.a', operator: 'eq', value: '2.a' },
                    { key: '2.b', operator: 'eq', value: '2.b' },
                    { key: '2.c', operator: 'eq', value: '2.c' },
                ] },
                { key: '3.a', operator: 'eq', value: '3.a' },
            ] }
        ] };

        assert.deepEqual(normalize(condition), normalized);
    })

    it('should remove nested `not` conditions', () => {
        const condition = { operator: 'or', value: [
            {
                operator: 'not',
                value: { key: '1.a', operator: 'eq', value: '1.a' },
            }, {
                operator: 'not', value: {
                    operator: 'not',
                    value: { key: '1.b', operator: 'eq', value: '1.b' },
                }
            }, {
                operator: 'not', value: {
                    operator: 'not', value: {
                        operator: 'not',
                        value: { key: '1.c', operator: 'eq', value: '1.c' },
                    }
                }
            }, {
                operator: 'not', value: {
                    operator: 'not', value: {
                        operator: 'not', value: {
                            operator: 'not',
                            value: { key: '1.d', operator: 'eq', value: '1.d' },
                        }
                    }
                }
            }
        ] };

        const normalized = { operator: 'or', value: [
            {
                operator: 'not',
                value: { key: '1.a', operator: 'eq', value: '1.a' },
            },
            { key: '1.b', operator: 'eq', value: '1.b' },
            {
                operator: 'not',
                value: { key: '1.c', operator: 'eq', value: '1.c' },
            },
            { key: '1.d', operator: 'eq', value: '1.d' },
        ] };

        assert.deepEqual(normalize(condition), normalized);
    })

    it('should replace and/or conditions with only 1 subcondition with their subconditions', () => {
        const condition = { operator: 'or', value: [
            { operator: 'or', value: [
                { key: '1.a', operator: 'eq', value: '1.a' },
            ] },
            { operator: 'and', value: [
                { key: '2.a', operator: 'eq', value: '2.a' },
            ] },
        ] };

        const normalized = { operator: 'or', value: [
            { key: '1.a', operator: 'eq', value: '1.a' },
            { key: '2.a', operator: 'eq', value: '2.a' },
        ] };

        assert.deepEqual(normalize(condition), normalized);
    })

});
