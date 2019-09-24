# aql-serializer

Serializing utility for AQL components.

## Usage

```sh
npm install --save @ambassify/aql-serializer
```

```js
const aqlSerializer = require('@ambassify/aql-serializer');

const fields = { foo: true, bar: { baz: true, two: true } };
const condition = { key: 'foo', operator: 'eq', value: 1 };
const order = [
    { key: 'priority', direction: 'desc' },
    { key: 'id', direction: 'asc' }
];

console.log(aqlSerializer.fields(fields));
/**
 * foo,bar(baz,two)
 */

console.log(aqlSerializer.condition(condition));
/**
 * { "key": "foo", "operator": "eq", "value": 1 }
 * (alias for JSON.stringify)
 */

console.log(aqlSerializer.order(order));
/**
 * -priority,id
 */
