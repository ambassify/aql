# aql-postgres

Uitilities to run AQL queries on postgres databases. Currently it only supports building
the condition part of the query.

More information about AQL can be found [in the spec](https://github.com/ambassify/aql/tree/master/packages/spec).

Note that this utility builds raw SQL strings based on your input. You can provide
a context object that implements `escapeKey(key)`, `escapeValue(value)` and `escapeList(list)`
functions if you need some parts of the condition to be escaped.

## Usage

```sh
npm install --save @ambassify/aql-postgres
```

```js
const pgAQL = require('@ambassify/aql-postgres');

const condition = {
    operator: 'and',
    value: [
        { key: 'e.type', operator: 'in', value: [ 'video', 'image' ] },
        { key: 'e.likes', operator: 'gte', value: 10 },
    ]
};

/**
 * You need to provide a context object that has methods to escape values
 * to make them safe for use in SQL. The easiest way to do this is by using
 * parameters in your query. Knex allows named parameters for example. This
 * example shows you how it could be done.
 */
const context = {
    parameters: {},
    escapeKey(key) {
        return `${context.escapeValue(key)}:`;
    },
    escapeValue(value) {
        const name = `param_${Object.keys(context.parameters).length}`;
        context.parameters[name] = value;
        return `:${name}`;
    },
    escapeList(value) {
        return value.map(v => context.escapeValue(v)).join(',');
    }
};

const query = `
    SELECT *
    FROM engagement e
    WHERE ${pgAQL.condition(condition, context)}
`;

// use your favorite driver to execute the query
const results = await knex().raw(query, context.parameters);

```
