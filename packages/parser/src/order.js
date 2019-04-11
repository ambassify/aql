'use strict';

const ASC = 'asc';
const DESC = 'desc';

module.exports = function parseOrder(orderString = '') {
    if (typeof orderString !== 'string')
        return [];

    const regex = /^([-+])?(.+)$/i;
    return orderString
        .split(',')
        .filter(s => s.length)
        .map(s => {
            const parts = regex.exec(s);

            const key = parts[2];
            const direction = parts[1] == '-' ? DESC : ASC;

            return { key, direction };
        });
};

module.exports.ASC = ASC;
module.exports.DESC = DESC;
