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

module.exports = function parseFields(str) {
    if (!str)
        return {};

    if (typeof str !== 'string')
        throw new TypeError('Expected input to be a string');

    const lexingResult = lexer.tokenize(str);

    throwFirstError(lexingResult);

    parser.input = lexingResult.tokens;

    const fields = parser.fields();

    throwFirstError(parser);

    return fields;
};
