'use strict';

const assert = require('assert');

describe('# joi-extensions', function() {

    let Joi;

    before(function() {
        Joi = require('joi');
        Joi = require('../src')(Joi);
    });

    describe('# condition', function() {

        it('should be able to parse and validate AQL condition', () => {
            const input = JSON.stringify({ key: 'foo', operator: 'eq', value: 'bar' });
            const expected = JSON.parse(input)
            const result = Joi.aql().condition().validate(input);

            assert.deepEqual(result.value, expected);
            assert(!result.error, 'no error');
        });

        it('should emit an aql.condition error when coercion fails', () => {
            const input = 4;
            const result = Joi.aql().condition().validate(input);

            assert.deepEqual(result.value, input);
            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.condition');
        });

        it('should emit an aql.condition.key error when schema validation fails due to a key error', () => {
            const input = JSON.stringify({ key: 'foo', operator: 'eq', value: 1 });
            const schema = Joi.object({ bar: Joi.string() });
            const result = Joi.aql().condition(schema).validate(input);

            assert.deepEqual(result.value, input);
            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.condition.key');
        });

        it('should emit an aql.condition.value error when schema validation fails due to a value error', () => {
            const input = JSON.stringify({ key: 'foo', operator: 'eq', value: 1 });
            const schema = Joi.object({ foo: Joi.string() });
            const result = Joi.aql().condition(schema).validate(input);

            assert.deepEqual(result.value, input);
            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.condition.value');
        });

    });

    describe('# fields', function() {

        it('should be able to parse and validate AQL fields', () => {
            const input = 'foo,bar(baz)';
            const expected = { foo: true, bar: { baz: true } };
            const result = Joi.aql().fields().validate(input);

            assert.deepEqual(result.value, expected);
            assert(!result.error, 'no error');
        });

        it('should emit an aql.fields error when validation fails', () => {
            const input = 'foo,';
            const result = Joi.aql().fields().validate(input);

            assert.deepEqual(result.value, input);
            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.fields');
        });

    })

    describe('# order', function() {

        it('should be able to parse and validate AQL order', () => {
            const input = 'foo,-bar,baz';
            const expected = [
                { key: 'foo', direction: 'asc' },
                { key: 'bar', direction: 'desc' },
                { key: 'baz', direction: 'asc' },
            ];
            const result = Joi.aql().order().validate(input);

            assert.deepEqual(result.value, expected);
            assert(!result.error, 'no error');
        });

    });
});
