'use strict';

const { Lexer } = require('chevrotain');
const Parser = require('./parser');
const { ordered: tokens } = require('./tokens');

const lexer = new Lexer(tokens, { positionTracking: 'onlyOffset' });
const parser = new Parser();

function throwFirstError(result) {
    if (result.errors.length > 0) {
        const msg = result.errors[0].message;
        throw new Error(`Invalid field syntax: ${msg}`);
    }
}

function isFields(fields) {
    if (!fields || typeof fields !== 'object')
        return false;

    return Object.values(fields).every(v => {
        return typeof v === 'boolean' || isFields(v);
    });
}

module.exports = function parseFields(fields) {
    if (isFields(fields))
        return fields;

    if (!fields)
        return {};

    if (typeof fields !== 'string')
        throw new TypeError('Expected input to be a string');

    const lexingResult = lexer.tokenize(fields);

    throwFirstError(lexingResult);

    parser.input = lexingResult.tokens;

    fields = parser.fields();

    throwFirstError(parser);

    return fields;
};

module.exports.isFields = isFields;
