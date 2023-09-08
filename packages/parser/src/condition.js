'use strict';

function json(str) {
    try { return JSON.parse(str); } catch (err) { return null; }
}

function isCondition(c) {
    return c && typeof c === 'object' && c.operator;
}

module.exports = function parseCondition(str = '') {
    if (!str)
        return;

    if (isCondition(str))
        return str;

    if (typeof str !== 'string')
        throw new TypeError('Expected input to be a string');

    let parsed = json(str);

    if (isCondition(parsed))
        return parsed;

    parsed = json(decodeURIComponent(str));

    if (isCondition(parsed))
        return parsed;

    return;
};
