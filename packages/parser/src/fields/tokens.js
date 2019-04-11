'use strict';

const { createToken, Lexer } = require('chevrotain');

const Whitespace = createToken({ name: 'Whitespace', pattern: /\s+/, group: Lexer.SKIPPED });
const Comma = createToken({ name: 'Comma', pattern: /,/ });
const OpenParentheses = createToken({ name: 'OpenParentheses', pattern: /\(/ });
const CloseParentheses = createToken({ name: 'CloseParentheses', pattern: /\)/ });
const Identifier = createToken({ name: 'Identifier', pattern: /[^,()\s]+/ });

module.exports = {
    Whitespace,
    Comma,
    OpenParentheses,
    CloseParentheses,
    Identifier,
    ordered: [
        Whitespace,
        Comma,
        OpenParentheses,
        CloseParentheses,
        Identifier
    ]
};
