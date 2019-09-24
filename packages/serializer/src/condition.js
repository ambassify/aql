'use strict';

function isCondition(c) {
    return c && typeof c === 'object' && c.operator;
}

module.exports = function serializeCondition(condition) {
    if (typeof condition === 'string')
        return condition || undefined;

    if (!isCondition(condition))
        return;

    return JSON.stringify(condition);
};
