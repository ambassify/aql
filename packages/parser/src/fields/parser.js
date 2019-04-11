/* eslint-disable new-cap */
'use strict';

const { Parser } = require('chevrotain');
const tokens = require('./tokens');

class FieldsParser extends Parser {
    constructor() {
        super(tokens.ordered, { outputCst: false });

        this.RULE('fields', () => {
            const fields = {};

            this.MANY_SEP({
                SEP: tokens.Comma,
                DEF: () => Object.assign(fields, this.SUBRULE(this.field))
            });

            return fields;
        });

        this.RULE('field', () => {
            const key = this.CONSUME(tokens.Identifier).image;
            let value = true;

            this.OPTION(() => {
                this.CONSUME(tokens.OpenParentheses);
                value = this.SUBRULE(this.fields);
                this.CONSUME(tokens.CloseParentheses);
            });

            return { [key]: value };
        });

        this.performSelfAnalysis();
    }
}

module.exports = FieldsParser;
