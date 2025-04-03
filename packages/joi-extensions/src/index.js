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

function validateConditionValue(condition, schema, createError) {
    const { key, operator, value } = condition;

    if (Array.isArray(value) && LIST_OPERATORS.includes(operator)) {
        return value.map(v => {
            return validateConditionValue({ ...condition, value: v }, schema);
        });
    }

    const result = schema.validate(value, { language: { root: key } });

    if (result.error) {
        throw createError('value', {
            k: key,
            cause: result.error.message
        });
    }

    return result.value;
}

function validateConditionSchema(condition, schema, createError) {
    try {
        return Condition.map(condition, c => {
            if (!c.key)
                return c;

            let keySchema = null;
            try {
                keySchema = schema.extract(c.key);
            } catch (err) {
                if (!/Schema does not contain path/i.test(err.message))
                    throw createError('unknown', { cause: err.message });
            }

            if (!keySchema)
                throw createError('key', { k: c.key });


            return {
                ...c,
                value: validateConditionValue(c, keySchema, createError)
            };
        });
    } catch (err) {
        if (err instanceof Error)
            return createError('unknown', { cause: err.message });

        return err;
    }
}

function getFieldsKeys(fields, prefix = '') {
    return Object.keys(fields).flatMap(key => {
        const value = fields[key];

        if (!value)
            return;

        if (prefix)
            key = `${prefix}.${key}`;

        return typeof value === 'object'
            ? getFieldsKeys(value, key)
            : key;
    }).filter(Boolean);
}

function getOrderKeys(order) {
    return order.map(o => o.key);
}

function validateKey(key, schema, createError) {
    let keySchema = null;

    try {
        keySchema = schema.extract(key);
    } catch (err) {
        if (!/Schema does not contain path/i.test(err.message))
            return createError('unknown', { cause: err.message });
    }

    if (!keySchema)
        return createError('key', { k: key });
}

function createKeyValidator(extractKeys) {
    return function validateKeys(value, schema, createError) {
        const keys = extractKeys(value);

        for (const key of keys) {
            const error = validateKey(key, schema, createError);

            if (error)
                return error;
        }

        return value;
    };
}

const parsers = {
    condition: Parser.condition,// parseCondition,
    fields: Parser.fields,// parseFields,
    order: Parser.order,// parseOrder,
};

const schemaValidators = {
    condition: validateConditionSchema,
    fields: createKeyValidator(getFieldsKeys),
    order: createKeyValidator(getOrderKeys),
};

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
            'aql.fields.key': '{{#label}} includes an unknown key "{{#k}}" in the AQL fields',
            'aql.fields.unknown': '{{#label}} did not validate against the AQL fields schema: {{#cause}}',
            'aql.order': '{{#label}} must be a valid AQL order definition: {{#cause}}',
            'aql.order.key': '{{#label}} includes an unknown key "{{#k}}" in the AQL order',
            'aql.order.unknown': '{{#label}} did not validate against the AQL order schema: {{#cause}}',
        },
        coerce(value, helpers) {
            for (const ruleName of [ 'condition', 'fields', 'order' ]) {
                const rule = helpers.schema.$_getRule(ruleName);
                const parser = parsers[ruleName];

                if (!rule || !parser)
                    continue;

                try {
                    const parsed = parser(value);

                    // Not coerced
                    if (parsed === value || typeof parsed === 'undefined')
                        return;

                    return { value: parsed };
                } catch (err) {
                    return {
                        value,
                        errors: helpers.error(`aql.${ruleName}`, { cause: err.message })
                    };
                }
            }
        },
        rules: {
            'condition': {
                convert: true,
                method() {
                    return this.$_addRule('condition');
                },
                validate(value, helpers) {
                    if (Parser.condition.isCondition(value))
                        return value;

                    return helpers.error('aql.condition', { cause: 'invalid' });
                }
            },
            'fields': {
                convert: true,
                method() {
                    return this.$_addRule('fields');
                },
                validate(value, helpers) {
                    if (Parser.fields.isFields(value))
                        return value;

                    return helpers.error('aql.fields', { cause: 'invalid' });
                }
            },
            'order': {
                convert: true,
                method() {
                    return this.$_addRule('order');
                },
                validate(value, helpers) {
                    if (Parser.order.isOrder(value))
                        return value;

                    return helpers.error('aql.order', { cause: 'invalid' });
                }
            },
            'schema': {
                method(schema) {
                    return this.$_addRule({ name: 'schema', args: { schema } });
                },
                args: [ 'schema' ],
                validate(value, helpers, { schema }) {
                    const ruleName = [ 'condition', 'fields', 'order' ].find(n => {
                        return !!helpers.schema.$_getRule(n);
                    });

                    const validator = schemaValidators[ruleName];

                    if (!validator || !schema)
                        return value;

                    const createError = (code, context) => {
                        code = [ 'aql', ruleName, code ].filter(Boolean).join('.');
                        return helpers.error(code, context);
                    };

                    return validator(value, schema, createError);
                }
            }
        }
    });
