'use strict';

const assert = require('assert');
const parseCondition = require('../src/condition');

describe('# condition', function() {

    it('should throw an error when invalid input is passed', () => {
        assert.throws(() => parseCondition(true));
        assert.throws(() => parseCondition({}));
    });

    it('should return input that is already a condition', () => {
        const c = { operator: 'and', value: [] };
        assert.strictEqual(parseCondition(c), c);
    })

    it('should parse JSON conditions', () => {
        const c = { operator: 'and', value: [] };
        const test = JSON.stringify(c);
        assert.deepEqual(parseCondition(test), c);
    })

    it('should parse URI-encoded JSON conditions', () => {
        const c = { operator: 'and', value: [] };
        const test = encodeURIComponent(JSON.stringify(c));
        assert.deepEqual(parseCondition(test), c);
    })

    it('should ignore invalid condition strings', () => {
        assert.equal(parseCondition('foo'), undefined);
    })

});
