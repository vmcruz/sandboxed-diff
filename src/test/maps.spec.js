import diff, { ChangeType } from '..';

describe('Diff Maps', () => {
  it('supports Maps', () => {
    const a = new Map([
      ['foo', 'baz'],
      ['1', 1],
    ]);

    const b = new Map([
      ['foo', 'bar'],
      ['test', 1],
    ]);

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: 'Map (2) {', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"foo": "baz",',
        depth: 1,
        path: ['__MAP__', 'foo', { deleted: true, value: 'baz' }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"foo": "bar",',
        depth: 1,
        path: ['__MAP__', 'foo', { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.REMOVE,
        str: '"1": 1,',
        depth: 1,
        path: ['__MAP__', '1', { deleted: true, value: 1 }],
      },
      {
        type: ChangeType.ADD,
        str: '"test": 1,',
        depth: 1,
        path: ['__MAP__', 'test', { deleted: false, value: 1 }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('handles new Map additions', () => {
    const a = new Map();
    const b = new Map([['foo', 'bar']]);

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: 'Map (1) {', depth: 0, path: [] },
      {
        type: ChangeType.ADD,
        str: '"foo": "bar",',
        depth: 1,
        path: ['__MAP__', 'foo', { deleted: false, value: 'bar' }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('handles complex keys', () => {
    const objKey = { complex: 'foo' };
    const setKey = new Set(['foo']);
    const fnKey = function foo() {};
    const mapKey = new Map([['foo', 1]]);

    const a = new Map([[objKey, 'baz']]);
    const b = new Map([
      ['foo', 'bar'],
      [objKey, 'bar'],
      [setKey, 'bar'],
      [fnKey, 'bar'],
      [mapKey, 'bar'],
    ]);

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: 'Map (5) {', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '{"complex":"foo"}: "baz",',
        depth: 1,
        path: ['__MAP__', objKey, { deleted: true, value: 'baz' }],
      },
      {
        type: ChangeType.UPDATE,
        str: '{"complex":"foo"}: "bar",',
        depth: 1,
        path: ['__MAP__', objKey, { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.ADD,
        str: '"foo": "bar",',
        depth: 1,
        path: ['__MAP__', 'foo', { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.ADD,
        str: '"Set [\\"foo\\"]": "bar",',
        depth: 1,
        path: ['__MAP__', setKey, { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.ADD,
        str: '"Function foo": "bar",',
        depth: 1,
        path: ['__MAP__', fnKey, { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.ADD,
        str: '"Map (1) { \\"foo\\": 1 }": "bar",',
        depth: 1,
        path: ['__MAP__', mapKey, { deleted: false, value: 'bar' }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('handles nested Maps', () => {
    const a = new Map([
      ['foo', 'baz'],
      ['nested', new Map([['nested', 'mep']])],
      [
        'deeply-nested',
        new Map([
          ['inside-deeply-nested', 'map'],
          ['last', new Map([['nested', 'mep']])],
        ]),
      ],
    ]);

    const b = new Map([
      ['foo', 'bar'],
      ['nested', new Map([['nested', 'map']])],
      [
        'deeply-nested',
        new Map([
          [
            'last',
            new Map([
              ['nested', 'map'],
              ['foo', 'bar'],
            ]),
          ],
        ]),
      ],
    ]);

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: 'Map (3) {', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"foo": "baz",',
        depth: 1,
        path: ['__MAP__', 'foo', { deleted: true, value: 'baz' }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"foo": "bar",',
        depth: 1,
        path: ['__MAP__', 'foo', { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.NOOP,
        str: '"nested": Map (1) {',
        depth: 1,
        path: ['__MAP__', 'nested'],
      },
      {
        type: ChangeType.REMOVE,
        str: '"nested": "mep",',
        depth: 2,
        path: [
          '__MAP__',
          'nested',
          '__MAP__',
          'nested',
          { deleted: true, value: 'mep' },
        ],
      },
      {
        type: ChangeType.UPDATE,
        str: '"nested": "map",',
        depth: 2,
        path: [
          '__MAP__',
          'nested',
          '__MAP__',
          'nested',
          { deleted: false, value: 'map' },
        ],
      },
      {
        type: ChangeType.NOOP,
        str: '},',
        depth: 1,
        path: ['__MAP__', 'nested'],
      },
      {
        type: ChangeType.NOOP,
        str: '"deeply-nested": Map (1) {',
        depth: 1,
        path: ['__MAP__', 'deeply-nested'],
      },
      {
        type: ChangeType.REMOVE,
        str: '"inside-deeply-nested": "map",',
        depth: 2,
        path: [
          '__MAP__',
          'deeply-nested',
          '__MAP__',
          'inside-deeply-nested',
          { deleted: true, value: 'map' },
        ],
      },
      {
        type: ChangeType.NOOP,
        str: '"last": Map (2) {',
        depth: 2,
        path: ['__MAP__', 'deeply-nested', '__MAP__', 'last'],
      },
      {
        type: ChangeType.REMOVE,
        str: '"nested": "mep",',
        depth: 3,
        path: [
          '__MAP__',
          'deeply-nested',
          '__MAP__',
          'last',
          '__MAP__',
          'nested',
          { deleted: true, value: 'mep' },
        ],
      },
      {
        type: ChangeType.UPDATE,
        str: '"nested": "map",',
        depth: 3,
        path: [
          '__MAP__',
          'deeply-nested',
          '__MAP__',
          'last',
          '__MAP__',
          'nested',
          { deleted: false, value: 'map' },
        ],
      },
      {
        type: ChangeType.ADD,
        str: '"foo": "bar",',
        depth: 3,
        path: [
          '__MAP__',
          'deeply-nested',
          '__MAP__',
          'last',
          '__MAP__',
          'foo',
          { deleted: false, value: 'bar' },
        ],
      },
      {
        type: ChangeType.NOOP,
        str: '},',
        depth: 2,
        path: ['__MAP__', 'deeply-nested', '__MAP__', 'last'],
      },
      {
        type: ChangeType.NOOP,
        str: '},',
        depth: 1,
        path: ['__MAP__', 'deeply-nested'],
      },
      {
        type: ChangeType.NOOP,
        str: '}',
        depth: 0,
        path: [],
      },
    ]);
  });

  it('handles circular references', () => {
    const a = new Map();
    const b = new Map();
    const innerA = new Map();
    const innerB = new Map();

    innerA.set('foo', a);
    a.set('foo', innerA);

    innerB.set('bar', b);
    b.set('foo', innerB);

    // a = [['foo', Map([['foo', a ]])]]
    // b = [['foo', Map([['bar', b ]])]]
    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: 'Map (1) {', depth: 0, path: [] },
      {
        type: ChangeType.NOOP,
        str: '"foo": Map (1) {',
        depth: 1,
        path: ['__MAP__', 'foo'],
      },
      {
        type: ChangeType.REMOVE,
        str: '"foo": [Circular],',
        depth: 2,
        path: ['__MAP__', 'foo', '__MAP__', 'foo'],
      },
      {
        type: ChangeType.ADD,
        str: '"bar": [Circular],',
        depth: 2,
        path: ['__MAP__', 'foo', '__MAP__', 'bar'],
      },
      {
        type: ChangeType.NOOP,
        str: '},',
        depth: 1,
        path: ['__MAP__', 'foo'],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('handles circular references as keys', () => {
    const a = new Map();
    const b = new Map();

    b.set(b, 'foo');

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: 'Map (1) {', depth: 0, path: [] },
      {
        type: ChangeType.ADD,
        str: '"Map (1) { \\"[Circular]\\": \\"foo\\" }": "foo",',
        depth: 1,
        path: ['__MAP__', b, { deleted: false, value: 'foo' }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });
});
