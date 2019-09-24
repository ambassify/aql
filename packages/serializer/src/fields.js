'use strict';

function serializeFields(fields) {
    if (typeof fields === 'string')
        return fields || undefined;

    if (!fields || typeof fields !== 'object')
        return;

    return Object.keys(fields).reduce((acc, key) => {
        const value = fields[key];

        if (!value)
            return acc;

        const subFields = typeof value === 'object' && serializeFields(value);
        const str = subFields ? `${key}(${subFields})` : key;

        return acc.concat([ str ]);
    }, []).join(',') || undefined;
}


module.exports = serializeFields;
