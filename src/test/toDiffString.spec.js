import diff, { ChangeType } from '..';

const complexKey = { complex: 'key' }; // Shared reference

const a = {
  id: 123,
  name: 'Alice',
  email: 'alice@example.com',
  password: 'secret',
  preferences: {
    theme: 'dark',
    notifications: true,
    layout: ['grid', 'compact'],
  },
  metadata: new Map([
    [complexKey, 'value'], // Complex key (shared reference)
    ['role', 'admin'],
    ['permissions', new Set(['read', 'write', 'execute'])],
  ]),
  tags: new Set(['user', 'active']),
  lastLogin: new Date('2024-03-01T12:00:00Z').getTime(),
  custom: Object.create(null, { key: { value: 'value', enumerable: true } }),

  // Additional edge cases:
  emptyArray: [],
  emptyObject: {},
  nestedEmpty: { a: {} },
};

// Circular reference
a.self = a;

const b = {
  id: 123, // Unchanged
  name: 'Alice Johnson', // Changed
  email: 'alice@example.com', // Unchanged
  password: 'newsecret', // Should be redacted
  preferences: {
    theme: 'light', // Changed
    notifications: false, // Changed
    layout: ['list'], // Changed
    newFeature: true, // **Added property**
  },
  metadata: new Map([
    [complexKey, 'newValue'], // **Value changed, key remains the same**
    ['role', 'user'], // Changed
    ['permissions', new Set(['read', 'execute'])], // Removed "write"
    ['createdAt', new Date('2024-03-01T12:00:00Z').getTime()], // **Added property**
  ]),
  tags: new Set(['user', 'inactive', 'premium']), // **Added "premium" tag**
  lastLogin: new Date('2024-03-22T08:30:00Z').getTime(), // Changed
  custom: Object.create(null, { key: { value: 'modified', enumerable: true } }), // Changed in Object.create(null)

  // Additional edge cases:
  emptyArray: ['unexpected'], // Previously empty
  emptyObject: { newKey: 'new' }, // **Added property**
  nestedEmpty: { a: { b: 'value' } }, // Previously empty nested object
  newProp: 'New Value', // **New property at root level**
};

// Circular reference
b.self = b;

describe('toDiffString', () => {
  it('outputs with defaults', () => {
    const result = diff(a, b);

    expect(result.toDiffString()).toMatchSnapshot();
  });

  it('outputs without color', () => {
    const result = diff(a, b);

    const config = {
      withColors: false,
    };

    expect(result.toDiffString(config)).toMatchSnapshot();
  });

  it('outputs custom colors and symbols', () => {
    const result = diff(a, b);

    const config = {
      colors: {
        [ChangeType.NOOP]: (str) => `\x1b[36m${str}\x1b[0m`,
      },
      symbols: {
        [ChangeType.ADD]: '@',
        [ChangeType.REMOVE]: '#',
        [ChangeType.UPDATE]: '$',
        [ChangeType.NOOP]: '%',
      },
    };

    expect(result.toDiffString(config)).toMatchSnapshot();
  });

  it('outputs with custom wrapper and indentSize', () => {
    const result = diff(a, b);

    const config = {
      wrapper: ['```diff', '```'],
      indentSize: 5,
    };

    expect(result.toDiffString(config)).toMatchSnapshot();
  });

  it('outputs empty wrapper strings if missing', () => {
    const result = diff(a, b);

    expect(result.toDiffString({ wrapper: [] })).toMatchSnapshot();
    expect(result.toDiffString({ wrapper: null })).toMatchSnapshot();
  });
});
