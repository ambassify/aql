# aql-parser

Parsing utility for AQL components.

## Usage

```sh
npm install --save @ambassify/aql-parser
```

```js
const aqlParser = require('@ambassify/aql-parser');

const fields = 'foo,bar,(baz,two)'
const condition = JSON.stringify({ key: 'foo', operator: 'eq', value: 1 });
const order = '-priority,id';
const url = [
    'https://foo.bar/?fiels='
    encodeURIComponent(fields),
    '&condition=',
    encodeURIComponent(condition),
    '&order=',
    encodeURIComponent(order),
].join('');

console.log(aqlParser.fields(fields));
/**
 * {
 *   foo: true,
 *   bar: { baz: true, two: true }
 * }
 */

console.log(aqlParser.condition(condition));
/**
 * { key: 'foo', operator: 'eq', value: 1 }
 *
 * Supports:
 *   - url-encoded JSON string
 *   - JSON string
 *   - url-encoded nested query parameters
 * (see tests for details)
 */

console.log(aqlParser.order(order));
/**
 * [
 *   { key: 'priority', direction: 'descending' },
 *   { key: 'id', direction: 'ascending' }
 * ]
 */

console.log(aqlParser.url(url));
/**
 * {
 *   fields: ...,
 *   condition: ...,
 *   order: ...,
 * }
```
