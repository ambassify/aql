'use strict';

const assert = require('assert');

describe('# joi-extensions', function() {

    let Joi;

    before(function() {
        Joi = require('joi');
        Joi = require('../src')(Joi);
    });

    describe('# condition', function() {

        it('should be able to validate an AQL condition', () => {
            const input = { key: 'foo', operator: 'eq', value: 'bar' };
            const result = Joi.aql().condition().validate(input, {
                convert: false
            });

            assert(!result.error, 'no error');
            assert.deepEqual(result.value, input);
        });

        it('should emit an aql.condition for invalid AQL conditions', () => {
            const input = 1;
            const result = Joi.aql().condition().validate(input, {
                convert: false
            });

            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.condition');
            assert.deepEqual(result.value, input);
        });

        it('should be able to parse and validate an AQL condition', () => {
            const input = { key: 'foo', operator: 'eq', value: 'bar' };
            const result = Joi.aql().condition().validate(input);

            assert(!result.error, 'no error');
            assert.deepEqual(result.value, input);
        });

        it('should be able to parse and validate stringified AQL condition', () => {
            const input = JSON.stringify({ key: 'foo', operator: 'eq', value: 'bar' });
            const expected = JSON.parse(input)
            const result = Joi.aql().condition().validate(input);

            assert(!result.error, 'no error');
            assert.deepEqual(result.value, expected);
        });

        it('should emit an aql.condition error when coercion fails', () => {
            const input = 4;
            const result = Joi.aql().condition().validate(input);

            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.condition');
            assert.deepEqual(result.value, input);
        });

        it('should emit an aql.condition.key error when schema validation fails due to a key error', () => {
            const input = JSON.stringify({ key: 'foo', operator: 'eq', value: 1 });
            const expected = JSON.parse(input);
            const schema = Joi.object({ bar: Joi.string() });
            const result = Joi.aql().condition().schema(schema).validate(input);

            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.condition.key');
            assert.deepEqual(result.value, expected);
        });

        it('should emit an aql.condition.value error when schema validation fails due to a value error', () => {
            const input = JSON.stringify({ key: 'foo', operator: 'eq', value: 1 });
            const expected = JSON.parse(input);
            const schema = Joi.object({ foo: Joi.string() });
            const result = Joi.aql().condition().schema(schema).validate(input);

            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.condition.value');
            assert.deepEqual(result.value, expected);
        });

        it('should handle validating array-based condition operators', () => {
            const input = JSON.stringify({ key: 'foo', operator: 'in', value: [ 1, 2 ] });
            const expected = JSON.parse(input);
            const schema = Joi.object({ foo: Joi.number() });
            const result = Joi.aql().condition().schema(schema).validate(input);

            assert(!result.error, 'no error');
            assert.deepEqual(result.value, expected);
        });

        it('should handle nested conditions', () => {
            const input = JSON.stringify({
                operator: 'and',
                value: [
                    { key: 'foo', operator: 'eq', value: 1 },
                    { key: 'bar', operator: 'gt', value: 1 },
                ]
            });

            const expected = JSON.parse(input);
            const schema = Joi.object({ foo: Joi.number(), bar: Joi.number() });
            const result = Joi.aql().condition().schema(schema).validate(input);

            assert(!result.error, 'no error');
            assert.deepEqual(result.value, expected);
        });

    });

    describe('# fields', function() {

        it('should be able to validate AQL fields', () => {
            const input = { foo: true, bar: { baz: true } };
            const result = Joi.aql().fields().validate(input, {
                convert: false
            });

            assert(!result.error, 'no error');
            assert.deepEqual(result.value, input);
        });

        it('should emit an aql.fields for invalid AQL fields', () => {
            const input = 1;
            const result = Joi.aql().fields().validate(input, {
                convert: false
            });

            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.fields');
            assert.deepEqual(result.value, input);
        });

        it('should be able to parse and validate stringified AQL fields', () => {
            const input = 'foo,bar(baz)';
            const expected = { foo: true, bar: { baz: true } };
            const result = Joi.aql().fields().validate(input);

            assert(!result.error, 'no error');
            assert.deepEqual(result.value, expected);
        });

        it('should emit an aql.fields error when coercion fails', () => {
            const input = 'foo,';
            const result = Joi.aql().fields().validate(input);

            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.fields');
            assert.deepEqual(result.value, input);
        });

        it('should emit an aql.fields.key error when schema validation fails due to a key error', async () => {
            const input = 'foo';
            const expected = { foo: true };
            const schema = Joi.object({ bar: Joi.string() });
            const result = Joi.aql().fields().schema(schema).validate(input);

            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.fields.key');
            assert.deepEqual(result.value, expected);
        });

        it('should handle nested validation', async () => {
            const input = 'foo,bar(baz)';
            const expected = { foo: true, bar: { baz: true } };
            const schema = Joi.object({
                foo: Joi.string(),
                bar: Joi.object({
                    baz: Joi.number()
                })
            });
            const result = Joi.aql().fields().schema(schema).validate(input);

            assert(!result.error, 'no error');
            assert.deepEqual(result.value, expected);
        });

    })

    describe('# order', function() {

        it('should be able to validate AQL order', () => {
            const input = [
                { key: 'foo', direction: 'asc' },
                { key: 'bar', direction: 'desc' },
                { key: 'baz', direction: 'asc' },
            ];
            const result = Joi.aql().order().validate(input, { convert: false });

            assert(!result.error, 'no error');
            assert.deepEqual(result.value, input);
        });

        it('should emit an aql.order for invalid AQL order', () => {
            const input = 1;
            const result = Joi.aql().order().validate(input, {
                convert: false
            });

            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.order');
            assert.deepEqual(result.value, input);
        });

        it('should be able to parse and validate stringified AQL order', () => {
            const input = 'foo,-bar,baz';
            const expected = [
                { key: 'foo', direction: 'asc' },
                { key: 'bar', direction: 'desc' },
                { key: 'baz', direction: 'asc' },
            ];
            const result = Joi.aql().order().validate(input);

            assert(!result.error, 'no error');
            assert.deepEqual(result.value, expected);
        });

        it('should emit an aql.order.key error when schema validation fails due to a key error', () => {
            const input = 'foo';
            const expected = [ { key: 'foo', direction: 'asc' } ];
            const schema = Joi.object({ bar: Joi.string() });
            const result = Joi.aql().order().schema(schema).validate(input);

            assert(result.error instanceof Error, 'Validation error returned');
            assert.equal(result.error?.details?.at(0)?.type, 'aql.order.key');
            assert.deepEqual(result.value, expected);
        });

    });

    describe('# schema', function() {

        it('should support warning', () => {
            const input = 'foo';
            const expected = { foo: true };
            const schema = Joi.object({ bar: Joi.string() });
            const result = Joi.aql().fields().schema(schema).warn().validate(input);

            assert(!!result.warning);
            assert.equal(result.warning?.details?.at(0)?.type, 'aql.fields.key');
            assert.deepEqual(result.value, expected);
        })
    })
});

