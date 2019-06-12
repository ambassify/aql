'use strict';

const URL = require('url');
const QS = require('qs');

const parseFields = require('./fields');
const parseCondition = require('./condition');
const parseOrder = require('./order');

module.exports = function parseUrl(str = '') {
    if (!str)
        return {};

    if (typeof str !== 'string')
        throw new TypeError('Expected input to be a string');

    const parsed = URL.parse(str);
    const query = QS.parse(parsed.query || str);

    return {
        fields: parseFields(query.fields),
        condition: parseCondition(query.condition),
        order: parseOrder(query.order),
    };
};
