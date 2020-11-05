'use strict';

const { OPERATORS } = require('@ambassify/aql-condition');

function escapeLike(v) {
    if (typeof v !== 'string')
        return v;

    return v.replace(/(\/*)(%|_)/g, (m, m1, m2) => {
        if (m1.length % 2 == 1)
            return m;

        return m1 + '\\' + m2;
    });
}

function escapeKey(key, ctx) {
    if (ctx && ctx.escapeKey)
        return ctx.escapeKey(key);

    return key;
}

function escapeValue(value, ctx) {
    if (ctx && ctx.escapeValue)
        return ctx.escapeValue(value);

    return value;
}

function escapeList(list, ctx) {
    if (ctx && ctx.escapeList)
        return ctx.escapeList(list);

    return list;
}

function escape(condition, ctx) {
    return {
        ...condition,
        key: escapeKey(condition.key, ctx),
        value: escapeValue(condition.value, ctx),
    };
}

function comparison(condition, sqlOperator) {
    const { key, value } = condition;
    return `${key} ${sqlOperator} ${value}`;
}

function buildCondition(condition, ctx) {
    // eslint-disable-next-line no-use-before-define
    return CONSTRAINTS[condition.operator](condition, ctx);
}

const CONSTRAINTS = {
    [OPERATORS.AND](condition, ctx) {
        return condition.value
            .map(c => buildCondition(c, ctx))
            .map(c => `(${c})`)
            .join(' AND ');
    },
    [OPERATORS.OR](condition, ctx) {
        return condition.value
            .map(c => buildCondition(c, ctx))
            .map(c => `(${c})`)
            .join(' OR ');
    },
    [OPERATORS.NOT](condition, ctx) {
        return `NOT(${buildCondition(condition.value, ctx)})`;
    },

    [OPERATORS.KNOWN](condition, ctx) {
        return `${escapeKey(condition.key, ctx)} IS NOT NULL`;
    },
    [OPERATORS.UNKNOWN](condition, ctx) {
        return `${escapeKey(condition.key, ctx)} IS NULL`;
    },

    [OPERATORS.EQ](condition, ctx) {
        return comparison(escape(condition, ctx), '=');
    },
    [OPERATORS.NEQ](condition, ctx) {
        return comparison(escape(condition, ctx), '<>');
    },

    [OPERATORS.GT](condition, ctx) {
        return comparison(escape(condition, ctx), '>');
    },
    [OPERATORS.GTE](condition, ctx) {
        return comparison(escape(condition, ctx), '>=');
    },
    [OPERATORS.LT](condition, ctx) {
        return comparison(escape(condition, ctx), '<');
    },
    [OPERATORS.LTE](condition, ctx) {
        return comparison(escape(condition, ctx), '<=');
    },

    [OPERATORS.BETWEEN](condition, ctx) {
        const key = escapeKey(condition.key, ctx);
        const v1 = escapeValue(condition.value[0], ctx);
        const v2 = escapeValue(condition.value[1], ctx);

        return `${key} BETWEEN ${v1} AND ${v2}`;
    },

    [OPERATORS.IN](condition, ctx) {
        return comparison({
            key: escapeKey(condition.key, ctx),
            value: `(${escapeList(condition.value, ctx)})`
        }, 'IN');
    },
    [OPERATORS.NOT_IN](condition, ctx) {
        return comparison({
            key: escapeKey(condition.key, ctx),
            value: `(${escapeList(condition.value, ctx)})`
        }, 'NOT IN');
    },

    [OPERATORS.STARTS_WITH](condition, ctx) {
        return comparison(escape({
            ...condition,
            value: `${escapeLike(condition.value)}%`
        }, ctx), 'ILIKE');
    },
    [OPERATORS.ENDS_WITH](condition, ctx) {
        return comparison(escape({
            ...condition,
            value: `%${escapeLike(condition.value)}`
        }, ctx), 'ILIKE');
    },
    [OPERATORS.CONTAINS](condition, ctx) {
        return comparison(escape({
            ...condition,
            value: `%${escapeLike(condition.value)}%`
        }, ctx), 'ILIKE');
    },
    [OPERATORS.NOT_CONTAINS](condition, ctx) {
        return comparison(escape({
            ...condition,
            value: `%${escapeLike(condition.value)}%`
        }, ctx), 'NOT ILIKE');
    },

    [OPERATORS.MATCH](condition, ctx) {
        return comparison(escape(condition, ctx), '~*');
    },
    [OPERATORS.NOT_MATCH](condition, ctx) {
        return comparison(escape(condition, ctx), '!~*');
    },

    [OPERATORS.NONE_OF](condition, ctx) {
        return `NOT(${comparison(escape(condition, ctx), '&&')})`;
    },
    [OPERATORS.ANY_OF](condition, ctx) {
        return comparison(escape(condition, ctx), '&&');
    },
    [OPERATORS.ALL_OF](condition, ctx) {
        return comparison(escape(condition, ctx), '@>');
    },
};

module.exports = {
    condition: buildCondition,
};
