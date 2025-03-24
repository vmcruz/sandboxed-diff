# @sandboxed/diff

A **zero dependency, high-performance, security-conscious** JavaScript diffing library for comparing complex data structures with ease.

## Features

- ⚡️ **Zero dependencies** – lightweight and no external libraries required
- 📝 Detects **additions, deletions, and modifications**
- 💡 Supports **Primitives, Objects, Arrays, Maps, and Sets**
- 🔄 **Handles circular references** safely
- 🛠️ **Highly configurable** to fit different use cases
- 🚨 **Built with security in mind** to prevent prototype pollution and other risks
- 💻 Works in both **Node.js and browser environments**

## Installation

```
npm install @sandboxed/diff

yarn add @sandboxed/diff
```

### Supports `esm` and `cjs`

Works with both ESM (`import`) and CJS (`require`). Use the syntax that matches your environment:

```javascript
// ESM
import diff, { ChangeType } from '@sandboxed/diff';

// CJS option 1
const diff = require('@sandboxed/diff').default;
const { ChangeType } = require('@sandboxed/diff');

// CJS option 2
const { default: diff, ChangeType } = require('@sandboxed/diff');
```

## Usage

#### `diff(lhs: any, rhs: any, config?: DiffConfig): Diff`

```javascript
import diff, { ChangeType } from '@sandboxed/diff';

const a = { name: "Alice", age: 25 };
const b = { name: "Alice", age: 26, city: "New York" };

const result = diff(a, b);

console.log(result);
console.log(result.toDiffString());
console.log(result.equal); // false
```

**Output**:

```javascript
[
  { type: 'noop', str: '{', depth: 0, path: [] },
  {
    type: 'noop',
    str: '"name": "Alice",',
    depth: 1,
    path: [ 'name', { deleted: false, value: 'Alice' } ]
  },
  {
    type: 'remove',
    str: '"age": 25,',
    depth: 1,
    path: [ 'age', { deleted: true, value: 25 } ]
  },
  {
    type: 'update',
    str: '"age": 26,',
    depth: 1,
    path: [ 'age', { deleted: false, value: 26 } ]
  },
  {
    type: 'add',
    str: '"city": "New York",',
    depth: 1,
    path: [ 'city', { deleted: false, value: 'New York' } ]
  },
  { type: 'noop', str: '}', depth: 0, path: [] }
]

// ---

{
   "name": "Alice",
-  "age": 25,
!  "age": 26,
+  "city": "New York",
}
```

## Config

| option | Description |
|-|-|
|[config.include](/docs/config.md#include-changetype--changetype)| Include only these change types from the diff result. Can be combined with `exclude`. |
|[config.exclude](/docs/config.md#exclude-changetype--changetype)| Excludes the change types from the diff result. Can be combined with `include`. |
|[config.strict](/docs/config.md#strict-boolean)| Performs loose type check if disabled. |
|[config.showUpdatedOnly](/docs/config.md#showupdatedonly-boolean)| `@sandboxed/diff` creates a `ChangeType.REMOVE` entry for every `ChangeType.UPDATE`. This flags prevents this behavior. |
|[config.pathHints](/docs/config.md#pathhints-pathints)| Hashmap of `map` and `set` path hints. These strings will be used in the `path` array to provide a hit about the object's type. |
|[config.redactKeys](/docs/config.md#redactkeys-arraystring)| List of keys that should be redacted from the output. Works with `string` based keys and serialized `Symbol`. |
|[config.maxDepth](/docs/config.md#maxdepth-number)| Max depth that the diffing function can traverse. |
|[config.maxKeys](/docs/config.md#maxkeys-number)| Max keys the diffing function can traverse. |
|[config.timeout](/docs/config.md#timeout-number)| Milliseconds before throwing a timeout error. |

## Utils

| util | Description |
|-|-|
|[toDiffString](/docs/utils.md#diff-string-output)| Generates the diff string representation of the diff result. |
|[equal](/docs/utils.md#equality-detection)| Determines whether the inputs are structurally equal based on the diff result. |

## Motivation

Many diffing libraries are optimized for either structured output or human-readable text, but rarely both. `@sandboxed/diff` is designed to provide a structured diff result along with a utility to generate a string representation, making it easy to use in both programmatic logic and UI rendering.

Trade-off: It may be **slower than other libraries**, but if you prioritize structured diffs with a built-in string representation, `@sandboxed/diff` is a great fit.

## LICENSE

[MIT](LICENSE)
