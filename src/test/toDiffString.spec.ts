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
  metadata: new Map<any, any>([
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

// @ts-expect-error mimics circular
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
  metadata: new Map<any, any>([
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

// @ts-expect-error mimics circular
b.self = b;

describe('toDiffString', () => {
  it('outputs with defaults', () => {
    const result = diff(a, b);

    expect(result.toDiffString()).toMatchSnapshot();
  });

  it('outputs with color', () => {
    const result = diff(a, b);

    const config = {
      withColors: true,
    };

    expect(result.toDiffString(config)).toMatchSnapshot();
  });

  it('outputs custom colors and symbols', () => {
    const result = diff(a, b);

    const config = {
      withColors: true,
      colors: {
        [ChangeType.NOOP]: (str: string) => `\x1b[36m${str}\x1b[0m`,
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

  it('throws if colors or symbols are not defined', () => {
    const result = diff(a, b);

    const configNoSymbol = {
      symbols: {
        [ChangeType.ADD]: undefined,
      },
    };

    expect(() => result.toDiffString(configNoSymbol)).toThrow(
      '<add> symbol missing in config'
    );

    const configNoColor = {
      withColors: true,
      colors: {
        [ChangeType.NOOP]: undefined,
      },
    };

    expect(() => result.toDiffString(configNoColor)).toThrow(
      '<noop> color function missing in config'
    );
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
    expect(result.toDiffString({ wrapper: undefined })).toMatchSnapshot();
  });
});
