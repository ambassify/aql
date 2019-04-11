'use strict';

const { createToken } = require('chevrotain');

const Comma = createToken({ name: 'Comma', pattern: /,/ });
const OpenParentheses = createToken({ name: 'OpenParentheses', pattern: /\(/ });
const CloseParentheses = createToken({ name: 'CloseParentheses', pattern: /\)/ });
const Identifier = createToken({ name: 'Identifier', pattern: /[^,()\s]+/ });

module.exports = {
    Comma,
    OpenParentheses,
    CloseParentheses,
    Identifier,
    ordered: [
        Comma,
        OpenParentheses,
        CloseParentheses,
        Identifier
    ]
};
