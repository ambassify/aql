# aql-parser

Joi extensions for AQL.

## Usage

```sh
npm install --save @ambassify/aql-joi-extensions
```

```js
const extend = require('@ambassify/aql-joi-extensions');
const joi = extend(require('joi'));

const queryValidation = {
    condition: joi.aql().condition(),
    fields: joi.aql().fields(),
    order: joi.aql().order(),
};

const comment = joi.object({
    id: joi.number(),
    author: joi.string(),
    text: joi.string()
});

/**
 * Optionally, validate the condition/field/order's keys and (for conditions)
 * values based on the schema of a resource it will apply to.
 */
const commentQueryValidation = {
    condition: joi.aql().condition().schema(comment),
    fields: joi.aql().fields().schema(comment),
    order: joi.aql().order().schema(comment),
}

```
