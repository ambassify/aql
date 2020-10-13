'use strict';

const normalize = require('./normalize');
const OPERATORS = require('./operators');
const { KEYLESS, NOT } = OPERATORS;

function map(condition, predicate) {
    if (condition && KEYLESS.includes(condition.operator)) {
        let { value } = condition;

        value = condition.operator === NOT ?
            map(value, predicate) :
            value.map(c => map(c, predicate));

        condition = Object.assign({}, condition, { value });
    }

    return predicate(condition);
}

function pMap(condition, predicate) {
    return map(condition, c => {
        if (c && KEYLESS.includes(c.operator)) {
            const p = c.operator === NOT ?
                Promise.resolve(c.value) :
                Promise.all(c.value);

            return p
                .then(value => Object.assign({}, c, { value }))
                .then(predicate);
        }

        return predicate(c);
    });
}

function filter(condition, predicate) {
    if (!condition || !condition.operator)
        return null;

    if (KEYLESS.includes(condition.operator)) {
        let { value } = condition;

        value = condition.operator === NOT ?
            filter(value, predicate) :
            value.map(c => filter(c, predicate));

        return normalize(Object.assign({}, condition, { value }));
    }

    if (!predicate(condition))
        return null;

    return condition;
}

module.exports = { filter, map, pMap, };
