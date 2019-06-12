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

    STARTS_WITH: 'startsWith',
    ENDS_WITH: 'endsWith',
    CONTAINS: 'contains',
    MATCH: 'match',

    NONE_OF: 'noneOf',
    ANY_OF: 'anyOf',
    ALL_OF: 'allOf',
});

function _lcString(str) {
    return String(str || '').toLowerCase();
}

function _value(item, cond) {
    return _get(item, cond.key);
}

const tests = {
    /* eslint-disable no-use-before-define */
    [OPERATORS.AND]: (item, cond) => _every(cond.value, c => isMatch(item, c)),
    [OPERATORS.OR]: (item, cond) => _some(cond.value, c => isMatch(item, c)),
    [OPERATORS.NOT]: (item, cond) => !isMatch(item, cond.value),
    /* eslint-enable no-use-before-define */

    [OPERATORS.UNKNOWN]: (item, cond) => _isNil(_value(item, cond)),
    [OPERATORS.KNOWN]: (item, cond) => !tests[OPERATORS.UNKNOWN](item, cond),

    [OPERATORS.EQ]: (item, cond) => {
        let a = cond.value;
        let b = _value(item, cond);

        if (typeof a === 'string') {
            a = _lcString(a);
            b = _lcString(b);
        }

        return _isEqual(a, b);
    },
    [OPERATORS.NEQ]: (item, cond) => !tests[OPERATORS.EQ](item, cond),

    [OPERATORS.GT]: (item, cond) => _value(item, cond) > cond.value,
    [OPERATORS.GTE]: (item, cond) => _value(item, cond) >= cond.value,
    [OPERATORS.LT]: (item, cond) => _value(item, cond) < cond.value,
    [OPERATORS.LTE]: (item, cond) => _value(item, cond) <= cond.value,

    [OPERATORS.BETWEEN]: (item, cond) => (
        _value(item, cond) >= cond.value[0] &&
        _value(item, cond) <= cond.value[1]
    ),

    [OPERATORS.IN]: (item, cond) => _includes(cond.value, _value(item, cond)),

    [OPERATORS.STARTS_WITH]: (item, cond) => {
        const subject = _lcString(_value(item, cond));
        const needle = _lcString(cond.value);
        return subject.indexOf(needle) === 0;
    },
    [OPERATORS.ENDS_WITH]: (item, cond) => {
        const subject = _lcString(_value(item, cond));
        const needle = _lcString(cond.value);
        return subject.indexOf(needle) === subject.length - needle.length;
    },
    [OPERATORS.CONTAINS]: (item, cond) => {
        const subject = _lcString(_value(item, cond));
        const needle = _lcString(cond.value);
        return subject.indexOf(needle) > -1;
    },
    [OPERATORS.MATCH]: (item, cond) => {
        const itemValue = _value(item, cond);
        const [ regex, flags ] = [].concat(cond.value || []);
        return (new RegExp(regex, flags)).test(itemValue);
    },

    [OPERATORS.NONE_OF]: (item, cond) => {
        const itemValue = _value(item, cond);
        return _every(cond.value, v => !_includes(itemValue, v));
    },
    [OPERATORS.ANY_OF]: (item, cond) => {
        const itemValue = _value(item, cond);
        return _some(cond.value, v => _includes(itemValue, v));
    },
    [OPERATORS.ALL_OF]: (item, cond) => {
        const itemValue = _value(item, cond);
        return _every(cond.value, v => _includes(itemValue, v));
    },
};

function isMatch(item, condition = {}) {
    const { operator } = condition;

    if (!operator)
        return true;

    const test = tests[operator];

    if (!test)
        throw new Error(`Invalid condition. Unknown operator: "${operator}"`);

    return test(item, condition);
}


function memoryFilter(dataset, condition = {}) {
    return _filter(dataset, item => isMatch(item, condition));
}

module.exports = memoryFilter;
module.exports.test = isMatch;
