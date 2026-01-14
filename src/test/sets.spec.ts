import diff, { ChangeType } from '..';

describe('Diff Sets', () => {
  it('supports Sets', () => {
    const a = new Set([1, 2, 3, 'bar']);
    const b = new Set([2, 'foo', 'bar']);

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: 'Set [', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '1,',
        depth: 1,
        path: ['__SET__', { deleted: true, value: 1 }],
      },
      {
        type: ChangeType.NOOP,
        str: '2,',
        depth: 1,
        path: ['__SET__', { deleted: false, value: 2 }],
      },
      {
        type: ChangeType.REMOVE,
        str: '3,',
        depth: 1,
        path: ['__SET__', { deleted: true, value: 3 }],
      },
      {
        type: ChangeType.NOOP,
        str: '"bar",',
        depth: 1,
        path: ['__SET__', { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.ADD,
        str: '"foo",',
        depth: 1,
        path: ['__SET__', { deleted: false, value: 'foo' }],
      },
      { type: ChangeType.NOOP, str: ']', depth: 0, path: [] },
    ]);
  });

  it('supports new Sets additions', () => {
    const a = new Set();
    const b = new Set(['foo', 'bar']);

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: 'Set [', depth: 0, path: [] },
      {
        type: ChangeType.ADD,
        str: '"foo",',
        depth: 1,
        path: ['__SET__', { deleted: false, value: 'foo' }],
      },
      {
        type: ChangeType.ADD,
        str: '"bar",',
        depth: 1,
        path: ['__SET__', { deleted: false, value: 'bar' }],
      },
      { type: ChangeType.NOOP, str: ']', depth: 0, path: [] },
    ]);
  });

  it('supports complex values', () => {
    const plainObject = Object.create(null);
    plainObject.foo = 'bar';

    const obj = { foo: 'bar' };

    const a = new Set([
      new Map([['foo', 'baz']]),
      obj,
      'foo',
      'baz',
      plainObject,
    ]);

    const b = new Set([
      new Map([['foo', 'bar']]),
      'foo',
      'bar',
      obj,
      plainObject,
    ]);

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: 'Set [', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"ref<Map>": Map (0) {',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.REMOVE,
        str: '"foo": "baz",',
        depth: 2,
        path: ['__SET__', '__MAP__', 'foo', { deleted: true, value: 'baz' }],
      },
      {
        type: ChangeType.REMOVE,
        str: '},',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.NOOP,
        str: '"ref<Object>": {',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.NOOP,
        str: '"foo": "bar",',
        depth: 2,
        path: ['__SET__', 'foo', { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.NOOP,
        str: '},',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.NOOP,
        str: '"foo",',
        depth: 1,
        path: ['__SET__', { deleted: false, value: 'foo' }],
      },
      {
        type: ChangeType.REMOVE,
        str: '"baz",',
        depth: 1,
        path: ['__SET__', { deleted: true, value: 'baz' }],
      },
      {
        type: ChangeType.NOOP,
        str: '"ref<object>": {',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.NOOP,
        str: '"foo": "bar",',
        depth: 2,
        path: ['__SET__', 'foo', { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.NOOP,
        str: '},',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.ADD,
        str: '"ref<Map>": Map (1) {',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.ADD,
        str: '"foo": "bar",',
        depth: 2,
        path: ['__SET__', '__MAP__', 'foo', { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.ADD,
        str: '},',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.ADD,
        str: '"bar",',
        depth: 1,
        path: ['__SET__', { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.NOOP,
        str: ']',
        depth: 0,
        path: [],
      },
    ]);
  });

  it('supports nested sets', () => {
    const a = new Set([new Set(['foo'])]);
    const b = new Set([new Set(['bar'])]);

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: 'Set [', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"ref<Set>": Set [',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.REMOVE,
        str: '"foo",',
        depth: 2,
        path: ['__SET__', '__SET__', { deleted: true, value: 'foo' }],
      },
      {
        type: ChangeType.REMOVE,
        str: '],',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.ADD,
        str: '"ref<Set>": Set [',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.ADD,
        str: '"bar",',
        depth: 2,
        path: ['__SET__', '__SET__', { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.ADD,
        str: '],',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.NOOP,
        str: ']',
        depth: 0,
        path: [],
      },
    ]);
  });

  it('handles same ref sets', () => {
    const foo = new Set(['foo']);
    const a = new Set([foo]);
    const b = new Set([foo]);

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: 'Set [', depth: 0, path: [] },
      {
        type: ChangeType.NOOP,
        str: '"ref<Set>": Set [',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.NOOP,
        str: '"foo",',
        depth: 2,
        path: ['__SET__', '__SET__', { deleted: false, value: 'foo' }],
      },
      {
        type: ChangeType.NOOP,
        str: '],',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.NOOP,
        str: ']',
        depth: 0,
        path: [],
      },
    ]);
  });

  it('handles circular references', () => {
    const a = new Set();
    a.add(a);

    const b = new Set();
    b.add(b);

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: 'Set [', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"ref<Set>": [Circular],',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.ADD,
        str: '"ref<Set>": [Circular],',
        depth: 1,
        path: ['__SET__'],
      },
      { type: ChangeType.NOOP, str: ']', depth: 0, path: [] },
    ]);
  });

  it('handles the same reference multiple times', () => {
    const sameRef = {};
    const a = new Set([{ foo: sameRef }, { bar: sameRef }]);

    expect(diff(undefined, a)).toEqual([
      { type: ChangeType.ADD, str: 'Set [', depth: 0, path: [] },
      {
        type: ChangeType.ADD,
        str: '"ref<Object>": {',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.ADD,
        str: '"foo": {',
        depth: 2,
        path: ['__SET__', 'foo'],
      },
      { type: ChangeType.ADD, str: '},', depth: 2, path: ['__SET__', 'foo'] },
      { type: ChangeType.ADD, str: '},', depth: 1, path: ['__SET__'] },
      {
        type: ChangeType.ADD,
        str: '"ref<Object>": {',
        depth: 1,
        path: ['__SET__'],
      },
      {
        type: ChangeType.ADD,
        str: '"bar": {',
        depth: 2,
        path: ['__SET__', 'bar'],
      },
      { type: ChangeType.ADD, str: '},', depth: 2, path: ['__SET__', 'bar'] },
      { type: ChangeType.ADD, str: '},', depth: 1, path: ['__SET__'] },
      { type: ChangeType.ADD, str: ']', depth: 0, path: [] },
    ]);
  });
});
