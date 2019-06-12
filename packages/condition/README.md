# aql-condition

Tool to help you build AQL conditions in code.

## Usage

```sh
npm install --save @ambassify/aql-condition
```

```js
const Condition = require('@ambassify/aql-condition');
```

### Normalize

Get an normalized version of your condition. This function tries to strip as much
irrelevant parts of your condition as it can detect.

```js
condition = Condition.normalize(condition);
```

### Parse

Parse a condition string and normalize it.

```js
const url = `https://foo.com/?condition=${encodeURIComponent(JSON.stringify(condition))}`;
const condition = Condition.parse(url);
```

### Filter

Get a subcondition of a condition by recursively filtering out only the parts you are interested in.

E.g. if you only want parts of the condition that target the "foo" key:

```js
condition = Condition.filter(condition, c => c.key === 'foo');
```

### And / Or / Not

Easily construct normalized and/or/not conditions.

```js
condition = Condition.and(condition, extraCondition);
condition = Condition.or(condition, anotherCondition);
condition = Condtion.and(a, b, c, d, asMuchAsYouWant);
negated = Condition.not(condition);
```
