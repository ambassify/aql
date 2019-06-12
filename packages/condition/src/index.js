'use strict';

const aqlParser = require('@ambassify/aql-parser');

const KEYLESS = [ 'and', 'or', 'not' ];

function normalize(condition) {
    const { operator } = condition || {};
    let { value } = condition || {};

    if (!operator)
        return null;

    if (!KEYLESS.includes(operator))
        return condition;

    if (operator == 'and' || operator == 'or') {
        value = value.map(normalize).filter(Boolean);

        if (!value.length)
            return null;

        value = value.reduce((r, subCondition) => {
            if (subCondition.operator === operator)
                return r.concat(subCondition.value);
            else
                return r.concat(subCondition);
        }, []);

        if (value.length === 1)
            return value[0];
    } else if (operator === 'not') {
        value = normalize(value);

        if (!value)
            return null;

        if (value.operator === operator)
            return value.value;
    }

    return { operator, value };
}

function parse(str) {
    const condition = aqlParser.condition(str) ||
        (aqlParser.url(str) || {}).condition;

    return normalize(condition);
}

function filter(condition, predicate) {
    if (!condition || !condition.operator)
        return null;

    if (KEYLESS.includes(condition.operator)) {
        let { value } = condition;

        value = condition.operator === 'not' ?
            filter(value, predicate) :
            value.map(c => filter(c, predicate));

        return normalize(Object.assign({}, condition, { value }));
    }

    if (!predicate(condition))
        return null;

    return condition;
}

function and(...conditions) {
    conditions = conditions.map(normalize).filter(Boolean);

    if (!conditions.length)
        return null;

    if (conditions.length === 1)
        return conditions[0];

    return normalize({ operator: 'and', value: conditions });
}

function or(...conditions) {
    conditions = conditions.map(normalize).filter(Boolean);

    if (!conditions.length)
        return null;

    if (conditions.length === 1)
        return conditions[0];

    return normalize({ operator: 'or', value: conditions });
}

function not(condition) {
    return normalize({ operator: 'not', value: condition });
}

module.exports = {
    parse,
    normalize,
    filter,
    and, or, not
};
