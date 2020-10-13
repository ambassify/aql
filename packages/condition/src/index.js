'use strict';

const aqlParser = require('@ambassify/aql-parser');

const normalize = require('./normalize');

function parse(str) {
    const condition = aqlParser.condition(str) ||
        (aqlParser.url(str) || {}).condition;

    return normalize(condition);
}

module.exports = {
    OPERATORS: require('./operators'),
    parse,
    normalize,
    isValid: require('./validate'),
    ...require('./builders'),
    ...require('./iterators'),
};
