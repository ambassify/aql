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

### Value retrieval

It is possible to customize how values are retrieved and the semantics
of matching them using the `mapTest`.

`mapTest` will receive items from the `dataset` one by one, the condition, and a callback.
`mapTest` passes all values it finds for the condition to the callback, which
will in turn return whether or not the `item` matches the condition.

The default implementation looks like the code below and will simply retrieve the value
at the `key` property and test it.
```js
function _defaultMapTest(input, condition, cb) {
    return cb(_get(input, condition.key));
}

aqlFilter(dataset, condition, { mapTest: _defaultMapTest });
```

A different implementation might want to check an array of properties and mandate 
that at least one matches.
```js
const propertyMapper = (input, condition, cb) => {
    const { key } = condition;

    if (/^prop\./.test(key)) {
        const prop = key.replace(/^prop\./, '');

        return input.properties.reduce((r, p) => {
            if (p.key == prop)
                return r || cb(p.value);
            return r;
        }, false);
    }

    return cb(input[key]);
};

aqlFilter(dataset, condition, { mapTest: propertyMapper });
```