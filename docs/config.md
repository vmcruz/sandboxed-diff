
## Config

#### `.include: ChangeType | ChangeType[]`

|||
|-|-|
| **Description** | Include only these change types from the diff result. Can be combined with `exclude`. |
| **Default** | `[ChangeType.NOOP, ChangeType.ADD, ChangeType.UPDATE, ChangeType.REMOVE]` |

```javascript
diff(a, b, { include: [ChangeType.ADD] }); // only additions

diff(a, b, {
  include: [ChangeType.ADD, ChangeType.NOOP],
}); // only additions + unchanged data
```

---

#### `.exclude: ChangeType | ChangeType[]`
|||
|-|-|
| **Description** | Excludes the change types from the diff result. Can be combined with `include`. |
| **Default** | `[]` |

```javascript
diff(a, b, { exclude: ChangeType.NOOP });

diff(a, b, { exclude: [ChangeType.ADD, ChangeType.NOOP] });
```

---

#### `.strict: boolean`

|||
|-|-|
| **Description** | Performs loose type check if disabled. |
| **Default** | `true` |

```javascript
const a = { foo: 1 };
const b = { foo: '1' };

console.log(diff(a, b).equal); // false

console.log(diff(a, b, { strict: false }).equal); // true
```

---

#### `.showUpdatedOnly: boolean`

|||
|-|-|
| **Description** | `@sandboxed/diff` creates a `ChangeType.REMOVE` entry for every `ChangeType.UPDATE`. This flags prevents this behavior. |
| **Default** | `false` |

```javascript
const a = { foo: 'baz' };
const b = { foo: 'bar' };

console.log(diff(a, b, { showUpdatedOnly: true }));
```

**Output**:
```javascript
[
  { type: 'noop', str: '{', depth: 0, path: [] },
  {
    type: 'update',
    str: '"foo": "bar",',
    depth: 1,
    path: [ 'foo', { deleted: false, value: 'bar' } ]
  },
  { type: 'noop', str: '}', depth: 0, path: [] }
]
```

---

#### `.pathHints: PatHints`

|||
|-|-|
| **Description** | Hashmap of `map` and `set` path hints. These strings will be used in the `path` array to provide a hit about the object's type. |
| **Default** | `{ map: '__MAP__', set: '__SET__' }` |

⚠️ Warning: **Complex keys are not recursively diffed**, they are treated as references only.
**Assume that any string entry in the path array comes from plain objects, and numeric entries come from arrays**. Without these hints, tracking back to the origin can be difficult, though can be disabled if not needed.

```javascript
const a = new Map([['foo', 'baz']]);
const b = new Map([['foo', 'bar']]);

const result = diff(a, b, { showUpdatedOnly: true });

// "foo: bar" update
console.log(result[1].path); // ['__MAP__', 'foo', { deleted: false, value: 'bar' }]
```

---

#### `.redactKeys: Array<string>`

|||
|-|-|
| **Description** | List of keys that should be redacted from the output. Works with `string` based keys and serialized `Symbol`.|
|**Default** | `[ 'password', 'secret', 'token', 'Symbol(password)', 'Symbol (secret)', 'Symbol(token)' ]` |

⚠️ Warning: Only the result `str` is redacted, the `path` array still contains the reference to the actual values. Be careful when using this for logging.

```javascript
const a = { password: 'pwd' };
const b = { password: 'secret' };

console.log(diff(a, b, { showUpdatedOnly: true }));
```

**Output**:
```javascript
[
  { type: 'noop', str: '{', depth: 0, path: [] },
  {
    type: 'update',
    str: '"password": "*****",',
    depth: 1,
    path: [ 'password', { deleted: false, value: 'secret' } ]
  },
  { type: 'noop', str: '}', depth: 0, path: [] }
]
```

---

#### `.maxDepth: number`

|||
|-|-|
| **Description** | Max depth that the diffing function can traverse. Throws when reaching the max. |
| **Default** | `50` |
| **Throws** | `Max depth exceeded!` |

---

#### `.maxKeys: number`

|||
|-|-|
| **Description** | Max keys the diffing function can traverse. Throws when reaching the max. |
|**Default** | `50` |
|**Throws** | `Object is too big to continue! Aborting.` |

---

#### `.timeout: number`

|||
|-|-|
| **Description** | Milliseconds before throwing a timeout error. |
|**Default** | `1000` |
|**Throws** | `Diff took too much time! Aborting.` |

⚠️ Warning: The diffing function does not check for object size in memory. The process can still hang if the system is unable to handle the object in memory.
