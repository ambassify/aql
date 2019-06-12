# aql-memory-filter

Run AQL conditions agains datasets in memory. This is an implementation of the AQL
condition filtering that can be run against an array in memory. You can find
database-specific implementations in various Ambassify projects, in the future
we hope to be able to provide these implementations here as well.

A list of all operators should be available [in the spec](https://github.com/ambassify/aql/tree/master/packages/spec).

## Usage

```sh
npm install --save @ambassify/aql-memory-filter
```

```js
const aqlFilter = require('@ambassify/aql-memory-filter');

const dataset = [
    { id: 1, type: 'post', title: 'Hello', likes: 5 },
    { id: 2, type: 'post', title: 'World', likes: 10 },
    { id: 3, type: 'article', title: 'This', likes: 32 },
    { id: 4, type: 'post', title: 'Is', likes: 4 },
    { id: 5, type: 'image', title: 'Me', likes: 100 },
];

const condition = {
    operator: 'and',
    value: [
        { key: 'type', operator: 'in', value: [ 'post', 'image' ] },
        { key: 'likes', operator: 'gte', value: 10 },
    ]
};

// filtered array includes ids 2 and 5
const filtered = aqlFilter(dataset, condition);

// test will return `true`
const ok = aqlFilter.test(dataset[1], condition);

// test will return `false`
const notOk = aqlFilter.test(dataset[0], condition);
```
