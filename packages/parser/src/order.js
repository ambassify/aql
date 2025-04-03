'use strict';

const ASC = 'asc';
const DESC = 'desc';

function isOrder(order) {
    return Array.isArray(order) && order.every(o => {
        return typeof o === 'object'
            && typeof o.key === 'string'
            && [ ASC, DESC ].includes(o.direction);
    });
}

module.exports = function parseOrder(order = '') {
    if (isOrder(order))
        return order;

    if (typeof order !== 'string')
        return [];

    const regex = /^([-+])?(.+)$/i;

    return order
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

module.exports.isOrder = isOrder;
