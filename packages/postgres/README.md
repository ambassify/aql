# aql-postgres

Uitilities to run AQL queries on postgres databases. Currently it only supports building
the condition part of the query.

More information about AQL can be found [in the spec](https://github.com/ambassify/aql/tree/master/packages/spec).

Note that this utility builds raw SQL strings based on your input. You yourself
are responsible for making sure identifiers en values are properly escaped
before feeding the AQL query to this utility.

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

const query = `
    SELECT *
    FROM engagement e
    WHERE ${pgAQL.condition(condition)}
`;

// use your favorite driver to execure the query
const results = await knex().raw(query);

```
