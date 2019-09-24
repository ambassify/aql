'use strict';

const ASC = 'asc';
const DESC = 'desc';

module.exports = function serializeOrder(order) {
    if (typeof order === 'string')
        return order || undefined;

    if (!Array.isArray(order))
        return;

    order = order.filter(o => (
        o.key &&
        o.direction &&
        Object.keys(o).length === 2
    ));

    if (!order.length)
        return;

    return order
        .map(o => {
            if (o.direction === ASC)
                return o.key;

            return '-' + o.key;
        })
        .join(',');
};

module.exports.ASC = ASC;
module.exports.DESC = DESC;
