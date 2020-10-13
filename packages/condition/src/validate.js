'use strict';

const OPERATORS = require('./operators');

function isString(v) {
    return typeof v === 'string';
}

function isCondition(c) {
    if (!c || typeof c !== 'object')
        return false;

    // eslint-disable-next-line no-use-before-define
    if (!c.operator || !VALIDATORS[c.operator])
        return false;

    return OPERATORS.KEYLESS.includes(c.operator)
        ? true
        : !!c.key;
}

function isValid(condition) {
    if (!isCondition(condition))
        return false;

    // eslint-disable-next-line no-use-before-define
    return VALIDATORS[condition.operator](condition);
}

const VALIDATORS = {
    [OPERATORS.AND](condition) {
        return (
            isCondition(condition) &&
            Array.isArray(condition.value) &&
            condition.value.every(isValid)
        );
    },
    [OPERATORS.OR](condition) {
        return (
            isCondition(condition) &&
            Array.isArray(condition.value) &&
            condition.value.every(isValid)
        );
    },
    [OPERATORS.NOT](condition) {
        return isCondition(condition) && isValid(condition.value);
    },

    [OPERATORS.KNOWN]: isCondition,
    [OPERATORS.UNKNOWN]: isCondition,
    [OPERATORS.EQ]: isCondition,
    [OPERATORS.NEQ]: isCondition,
    [OPERATORS.GT]: isCondition,
    [OPERATORS.GTE]: isCondition,
    [OPERATORS.LT]: isCondition,
    [OPERATORS.LTE]: isCondition,

    [OPERATORS.BETWEEN](condition) {
        return (
            isCondition(condition) &&
            Array.isArray(condition.value) &&
            condition.value.length === 2
        );
    },

    [OPERATORS.IN](condition) {
        return isCondition(condition) && Array.isArray(condition.value);
    },
    [OPERATORS.NOT_IN](condition) {
        return isCondition(condition) && Array.isArray(condition.value);
    },

    [OPERATORS.STARTS_WITH](condition) {
        return isCondition(condition) && isString(condition.value);
    },
    [OPERATORS.ENDS_WITH](condition) {
        return isCondition(condition) && isString(condition.value);
    },
    [OPERATORS.CONTAINS](condition) {
        return isCondition(condition) && isString(condition.value);
    },
    [OPERATORS.NOT_CONTAINS](condition) {
        return isCondition(condition) && isString(condition.value);
    },
    [OPERATORS.MATCH](condition) {
        return isCondition(condition) && isString(condition.value);
    },
    [OPERATORS.NOT_MATCH](condition) {
        return isCondition(condition) && isString(condition.value);
    },

    [OPERATORS.NONE_OF](condition) {
        return isCondition(condition) && Array.isArray(condition.value);
    },
    [OPERATORS.ANY_OF](condition) {
        return isCondition(condition) && Array.isArray(condition.value);
    },
    [OPERATORS.ALL_OF](condition) {
        return isCondition(condition) && Array.isArray(condition.value);
    },
};

module.exports = isValid;
