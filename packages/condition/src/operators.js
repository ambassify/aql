'use strict';

module.exports = Object.freeze({
    KEYLESS: [ 'and', 'or', 'not' ],
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
