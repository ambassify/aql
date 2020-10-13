'use strict';

const OPERATORS = require('./operators');
const { KEYLESS, AND, OR, NOT } = OPERATORS;

function normalize(condition) {
    const { operator } = condition || {};
    let { value } = condition || {};

    if (!operator)
        return null;

    if (!KEYLESS.includes(operator))
        return condition;

    if (operator == AND || operator == OR) {
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
    } else if (operator === NOT) {
        value = normalize(value);

        if (!value)
            return null;

        if (value.operator === operator)
            return value.value;
    }

    return { operator, value };
}

module.exports = normalize;
