'use strict';

const normalize = require('./normalize');

const OPERATORS = require('./operators');
const { AND, OR, NOT } = OPERATORS;

function and(...conditions) {
    conditions = conditions.map(normalize).filter(Boolean);

    if (!conditions.length)
        return null;

    if (conditions.length === 1)
        return conditions[0];

    return normalize({ operator: AND, value: conditions });
}

function or(...conditions) {
    conditions = conditions.map(normalize).filter(Boolean);

    if (!conditions.length)
        return null;

    if (conditions.length === 1)
        return conditions[0];

    return normalize({ operator: OR, value: conditions });
}

function not(condition) {
    return normalize({ operator: NOT, value: condition });
}

module.exports = { and, or, not };
