const { Lexer } = require("chevrotain");
const Parser = require('./parser');
const { ordered: tokens } = require('./tokens');

const lexer = new Lexer(tokens, { positionTracking: 'onlyOffset' });
const parser = new Parser();

module.exports = function parseFields(str) {
    if (typeof str !== 'string')
        throw new TypeError('Expected input to be a string');

    parser.input = lexer.tokenize(str).tokens;

    const result = parser.fields();

    if (parser.errors.length > 0) {
        const msg = parser.errors[0].message;
        throw new Error(`Invalid field syntax: ${msg}`);
    }

    return result;
}
