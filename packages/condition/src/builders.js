'use strict';

const normalize = require('./normalize');

const OPERATORS = require('./operators');

function createMultiConditionBuilder(operator) {
    return function buildMultiCondition(...conditions) {
        conditions = conditions.map(normalize).filter(Boolean);

        if (!conditions.length)
            return null;

        if (conditions.length === 1)
            return conditions[0];

        return normalize({ operator, value: conditions });
    };
}

function createValuelessBuilder(operator) {
    return function(key) {
        return { key, operator };
    };
}

function createBuilder(operator) {
    return function(key, value) {
        return { key, operator, value};
    };
}

module.exports.and = createMultiConditionBuilder(OPERATORS.AND);
module.exports.or = createMultiConditionBuilder(OPERATORS.OR);
module.exports.not = c => normalize({ operator: OPERATORS.NOT, value: c });

module.exports.known = createValuelessBuilder(OPERATORS.KNOWN);
module.exports.unknown = createValuelessBuilder(OPERATORS.UNKNOWN);

module.exports.eq = createBuilder(OPERATORS.EQ);
module.exports.neq = createBuilder(OPERATORS.NEQ);

module.exports.gt = createBuilder(OPERATORS.GT);
module.exports.gte = createBuilder(OPERATORS.GTE);
module.exports.lt = createBuilder(OPERATORS.LT);
module.exports.lte = createBuilder(OPERATORS.LTE);

module.exports.between = createBuilder(OPERATORS.BETWEEN);

module.exports.in = createBuilder(OPERATORS.IN);
module.exports.notIn = createBuilder(OPERATORS.NOT_IN);

module.exports.startsWith = createBuilder(OPERATORS.STARTS_WITH);
module.exports.endsWith = createBuilder(OPERATORS.ENDS_WITH);
module.exports.contains = createBuilder(OPERATORS.CONTAINS);
module.exports.notContains = createBuilder(OPERATORS.NOT_CONTAINS);
module.exports.match = createBuilder(OPERATORS.MATCH);
module.exports.notMatch = createBuilder(OPERATORS.NOT_MATCH);

module.exports.noneOf = createBuilder(OPERATORS.NONE_OF);
module.exports.anyOf = createBuilder(OPERATORS.ANY_OF);
module.exports.allOf = createBuilder(OPERATORS.ALL_OF);
