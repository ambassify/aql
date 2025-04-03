'use strict';

const Condition = require('@ambassify/aql-condition');
const Parser = require('@ambassify/aql-parser');

/**
 * @note anyOf/allOf/noneOf are not included here as they compare two arrays
 *       hence the schema should already be validating an array
 */
const LIST_OPERATORS = [
    'between',
    'in',
    'notIn'
];

function validateConditionValue(condition, schema) {
    const { key, operator, value } = condition;

    if (Array.isArray(value) && LIST_OPERATORS.includes(operator)) {
        return value.map(v => {
            return validateConditionValue({ ...condition, value: v }, schema);
        });
    }

    const result = schema.validate(value, { language: { root: key } });

    if (result.error)
        throw result.error;

    return result.value;
}

function parseCondition(value, schema , helpers) {
    let parsed;

    const createError = (code, options) => ({
        value,
        errors: helpers.error(code, options)
    });

    try {
        parsed = Parser.condition(value);
    } catch (err) {
        return createError('aql.condition', { cause: err.message });
    }

    if (!schema)
        return { value: parsed };

    return Condition.map(parsed, c => {
        if (!c.key)
            return c;

        let keySchema = null;
        try {
            keySchema = schema.extract(c.key);
        } catch (err) {
            if (!/Schema does not contain path/i.test(err.message))
                return createError('aql.condition.unknown', { cause: err.message });
        }

        if (!keySchema)
            return createError('aql.condition.key', { k: c.key });


        try {
            return {
                value: {
                    ...c,
                    value: validateConditionValue(c, keySchema, createError)
                }
            };
        } catch (err) {
            return createError('aql.condition.value', {
                k: c.key,
                cause: err.message
            });
        }

    });
}

module.exports = Joi => Joi
    .extend({
        type: 'aql',
        base: Joi.any(),
        messages: {
            'aql.condition': '{{#label}} must be a valid AQL condition: {{#cause}}',
            'aql.condition.key': '{{#label}} includes an unknown key "{{#k}}" in the AQL condition',
            'aql.condition.value': '{{#label}} includes an invalid value in the AQL condition at "{{#k}}": {{#cause}}',
            'aql.condition.unknown': '{{#label}} did not validate against the AQL condition schema: {{#cause}}',
            'aql.fields': '{{#label}} must be a valid AQL fields definition: {{#cause}}',
            'aql.order': '{{#label}} must be a valid AQL order definition: {{#cause}}',
        },
        prepare(value, helpers) {
            let rule = helpers.schema.$_getRule('condition');

            if (rule)
                return parseCondition(value, rule.args.schema, helpers);

            rule = helpers.schema.$_getRule('fields');

            if (rule) {
                try {
                    return { value: Parser.fields(value) };
                } catch (err) {
                    return {
                        value,
                        errors: helpers.error('aql.fields', { cause: err.message })
                    };
                }
            }

            rule = helpers.schema.$_getRule('order');

            if (rule) {
                try {
                    return { value: Parser.order(value) };
                } catch (err) {
                    return {
                        value,
                        errors: helpers.error('aql.order', { cause: err.message })
                    };
                }
            }
        },
        rules: {
            'condition': {
                convert: true,
                method(schema) {
                    return this.$_addRule({ name: 'condition', args: { schema } });
                },
                args: [ 'schema' ]
            },
            'fields': {
                convert: true,
            },
            'order': {
                convert: true,
            },
        }
    });
