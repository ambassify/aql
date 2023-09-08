'use strict';

const assert = require('assert');
const serializeCondition = require('../src/condition');

describe('# condition', function() {

    it('should leave strings alone', () => {
        assert.equal(serializeCondition('foo'), 'foo');
    });

    it('should serialize condtions to JSON', () => {
        const c = { operator: 'and', value: [] };
        const expected = JSON.stringify(c);
        assert.deepEqual(serializeCondition(c), expected);
    })

    it('should ignore invalid conditions', () => {
        assert.equal(serializeCondition(), undefined);
        assert.equal(serializeCondition({}), undefined);
        assert.equal(serializeCondition(true), undefined);
        assert.equal(serializeCondition(''), undefined);
        assert.equal(serializeCondition({ foo: 1 }), undefined);
        assert.equal(serializeCondition({ key: 1 }), undefined);
    })

});
