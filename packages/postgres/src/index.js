'use strict';

const { OPERATORS } = require('@ambassify/aql-condition');

function escapeLike(v) {
    if (typeof v !== 'string')
        return v;

    return v.replace(/(\/*)(%|_)/g, (m, m1, m2) => {
        if (m1.length % 2 == 1)
            return m;

        return m1 + '\\' + m2;
    });
}

function comparison(condition, sqlOperator) {
    const { key, value } = condition;
    return `${key} ${sqlOperator} ${value}`;
}

function buildCondition(condition) {
    // eslint-disable-next-line no-use-before-define
    return CONSTRAINTS[condition.operator](condition);
}

const CONSTRAINTS = {
    [OPERATORS.AND](condition) {
        return condition.value
            .map(c => buildCondition(c))
            .map(c => `(${c})`)
            .join(' AND ');
    },
    [OPERATORS.OR](condition) {
        return condition.value
            .map(c => buildCondition(c))
            .map(c => `(${c})`)
            .join(' OR ');
    },
    [OPERATORS.NOT](condition) {
        return `NOT(${buildCondition(condition.value)})`;
    },

    [OPERATORS.KNOWN](condition) {
        return `${condition.key} IS NOT NULL`;
    },
    [OPERATORS.UNKNOWN](condition) {
        return `${condition.key} IS NULL`;
    },

    [OPERATORS.EQ](condition) {
        return comparison(condition, '=');
    },
    [OPERATORS.NEQ](condition) {
        return comparison(condition, '<>');
    },

    [OPERATORS.GT](condition) {
        return comparison(condition, '>');
    },
    [OPERATORS.GTE](condition) {
        return comparison(condition, '>=');
    },
    [OPERATORS.LT](condition) {
        return comparison(condition, '<');
    },
    [OPERATORS.LTE](condition) {
        return comparison(condition, '<=');
    },

    [OPERATORS.BETWEEN](condition) {
        const { key, value } = condition;
        return `${key} BETWEEN ${value[0]} AND ${value[1]}`;
    },

    [OPERATORS.IN](condition) {
        return comparison({
            ...condition,
            value: `(${condition.value.join(',')})`
        }, 'IN');
    },
    [OPERATORS.NOT_IN](condition) {
        return comparison({
            ...condition,
            value: `(${condition.value.join(',')})`
        }, 'NOT IN');
    },

    [OPERATORS.STARTS_WITH](condition) {
        return comparison({
            ...condition,
            value: escapeLike(condition.value) + '%'
        }, 'LIKE');
    },
    [OPERATORS.ENDS_WITH](condition) {
        return comparison({
            ...condition,
            value: '%' + escapeLike(condition.value)
        }, 'LIKE');
    },
    [OPERATORS.CONTAINS](condition) {
        return comparison({
            ...condition,
            value: '%' + escapeLike(condition.value) + '%'
        }, 'LIKE');
    },
    [OPERATORS.NOT_CONTAINS](condition) {
        return comparison({
            ...condition,
            value: '%' + escapeLike(condition.value) + '%'
        }, 'NOT LIKE');
    },

    [OPERATORS.MATCH](condition) {
        return comparison(condition, '~*');
    },
    [OPERATORS.NOT_MATCH](condition) {
        return comparison(condition, '!~*');
    },

    [OPERATORS.NONE_OF](condition) {
        return `NOT(${comparison(condition, '&&')})`;
    },
    [OPERATORS.ANY_OF](condition) {
        return comparison(condition, '&&');
    },
    [OPERATORS.ALL_OF](condition) {
        return comparison(condition, '@>');
    },
};

module.exports = {
    condition: buildCondition,
};
