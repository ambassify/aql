'use strict';

const _every = require('lodash/every');
const _filter = require('lodash/filter');
const _get = require('lodash/get');
const _includes = require('lodash/includes');
const _isEqual = require('lodash/isEqual');
const _isNil = require('lodash/isNil');
const _some = require('lodash/some');

// @todo get this from a centralized package; aql-condition / aql-speq / ...?
const OPERATORS = Object.freeze({
    AND: 'and',
    OR: 'or',
    NOT: 'not',

    KNOWN: 'known',
    UNKNOWN: 'unknown',

    EQ: 'eq',
    NEQ: 'neq',

    GT: 'gt',
    GTE: 'gte',
    LT: 'lt',
    LTE: 'lte',

    BETWEEN: 'between',

    IN: 'in',
    NOT_IN: 'notIn',

    STARTS_WITH: 'startsWith',
    ENDS_WITH: 'endsWith',
    CONTAINS: 'contains',
    NOT_CONTAINS: 'notContains',
    MATCH: 'match',
    NOT_MATCH: 'notMatch',

    NONE_OF: 'noneOf',
    ANY_OF: 'anyOf',
    ALL_OF: 'allOf',
});

function _lcString(str) {
    return String(str || '').toLowerCase();
}

function _negate(test) {
    return (v, cond) => !test(v, cond);
}

function _defaultMapTest(input, condition, cb) {
    return cb(_get(input, condition.key));
}

const tests = {
    [OPERATORS.UNKNOWN]: (v) => _isNil(v),
    [OPERATORS.KNOWN]: (v) => !tests[OPERATORS.UNKNOWN](v),

    [OPERATORS.EQ]: (b, cond) => {
        let a = cond.value;

        if (typeof a === 'string') {
            a = _lcString(a);
            b = _lcString(b);
        }

        return _isEqual(a, b);
    },
    [OPERATORS.NEQ]: (v, cond) => !tests[OPERATORS.EQ](v, cond),

    [OPERATORS.GT]: (v, cond) => v > cond.value,
    [OPERATORS.GTE]: (v, cond) => v >= cond.value,
    [OPERATORS.LT]: (v, cond) => v < cond.value,
    [OPERATORS.LTE]: (v, cond) => v <= cond.value,

    [OPERATORS.BETWEEN]: (v, cond) => (
        v >= cond.value[0] &&
        v <= cond.value[1]
    ),

    [OPERATORS.IN]: (v, cond) => _includes(cond.value, v),

    [OPERATORS.STARTS_WITH]: (v, cond) => {
        const subject = _lcString(v);
        const needle = _lcString(cond.value);
        return subject.indexOf(needle) === 0;
    },
    [OPERATORS.ENDS_WITH]: (v, cond) => {
        const subject = _lcString(v);
        const needle = _lcString(cond.value);
        return subject.indexOf(needle) === subject.length - needle.length;
    },
    [OPERATORS.CONTAINS]: (v, cond) => {
        const subject = _lcString(v);
        const needle = _lcString(cond.value);
        return subject.indexOf(needle) > -1;
    },
    [OPERATORS.MATCH]: (itemValue, cond) => {
        const [ regex, flags ] = [].concat(cond.value || []);
        return (new RegExp(regex, flags)).test(itemValue);
    },

    [OPERATORS.NONE_OF]: (itemValue, cond) => {
        return _every(cond.value, v => !_includes(itemValue, v));
    },
    [OPERATORS.ANY_OF]: (itemValue, cond) => {
        return _some(cond.value, v => _includes(itemValue, v));
    },
    [OPERATORS.ALL_OF]: (itemValue, cond) => {
        return _every(cond.value, v => _includes(itemValue, v));
    },
};

tests[OPERATORS.NOT_IN] = _negate(tests[OPERATORS.IN]);
tests[OPERATORS.NOT_CONTAINS] = _negate(tests[OPERATORS.CONTAINS]);
tests[OPERATORS.NOT_MATCH] = _negate(tests[OPERATORS.MATCH]);

function isMatch(item, condition = {}, options = {}) {
    const { operator } = condition;

    if (!operator)
        return true;

    const {
        mapTest = _defaultMapTest,
    } = options;

    if (operator == OPERATORS.AND)
        return _every(condition.value, c => isMatch(item, c, options));

    if (operator == OPERATORS.OR)
        return _some(condition.value, c => isMatch(item, c, options));

    if (operator == OPERATORS.NOT)
        return !isMatch(item, condition.value, options);

    const test = tests[operator];

    if (!test)
        throw new Error(`Invalid condition. Unknown operator: "${operator}"`);

    return mapTest(item, condition, (v) => test(v, condition));
}


function memoryFilter(dataset, condition = {}, options = {}) {
    return _filter(dataset, item => isMatch(item, condition, options));
}

module.exports = memoryFilter;
module.exports.test = isMatch;
