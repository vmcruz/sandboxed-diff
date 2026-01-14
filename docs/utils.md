## Utils

### Diff string output

**`.toDiffString(config?: DiffStringConfig): string`**

Highly configurable util that generates the diff string representation of the diff result:

```javascript
import diff from '@sandboxed/diff';

const a = { name: 'Alice', age: 25 };
const b = { name: 'Alice', age: 26, city: 'New York' };

console.log(diff(a, b).toDiffString());
```

**Output**:

```
{
   "name": "Alice",
-  "age": 25,
!  "age": 26,
+  "city": "New York",
}
```

#### Config options

| config     | default  | Description                                                                                                          |
| ---------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| withColors | `false`  | Formats the string using AnsiColors.                                                                                 |
| colors     | `object` | Hashmap for coloring each line based on type: `[ChangeType]: (string) => string`. Should be compatible with `chalk`. |
| symbols    | `object` | Hashmap for prefixing each line based on type: `[ChangeType]: string`.                                               |
| wrapper    | `[]`     | Array with `string` entries. Wraps the result between the first two strings.                                         |
| indentSize | `2`      | Whitespace after the `config.symbols`. Indentation is done using `space`.                                            |

### Equality detection

**`.equal: boolen`**

Determines whether the inputs are structurally equal based on the diff result. It ignores any `ChangeType.NOOP` items.

```javascript
import diff from '@sandboxed/diff';

const a = { name: 'Alice', age: 25 };
const b = { name: 'Alice', age: 26, city: 'New York' };

console.log(diff(a, b).equal); // Output: false

// --

const c = { name: 'Alice', foo: new Set([1, 2, 'test']) };
const d = { name: 'Alice', foo: new Set(['test', 2, 1]) };

console.log(diff(c, d).equal); // Output: true
```

### ⚠️ Warning

Be aware that `.equal` is affected by the diff result. Should be used with caution when `cofig.include` or `config.exclude` are provided.

```javascript
import diff, { ChangeType } from '@sandboxed/diff';

const a = { name: 'Alice', foo: new Set([1, 2, 'test']) };
const b = { name: 'Alice', bar: new Set(['test', 2, 1]) };

console.log(diff(a, b, { exclude: [ChangeType.ADD, ChangeType.REMOVE] }).equal); // Output: true
```

Given that the diff result will not detect the changes in **`foo`**(`ChangeType.REMOVE`) or **`bar`** (`ChangeType.ADD`), the diff result will contain only `ChangeType.NOOP`, causing `.equal` to be `true`.
