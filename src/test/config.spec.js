import diff, { ChangeType } from '..';

describe('With Config', () => {
  it('diff selected changes only', () => {
    const a = {
      foo: 'baz',
      removed: 'removed key',
    };

    const b = {
      foo: 'bar',
      added: 'added key',
    };

    const result = diff(a, b, {
      include: [ChangeType.ADD, ChangeType.UPDATE],
    });

    expect(result).toEqual([
      {
        type: ChangeType.REMOVE, // part of the update
        str: '"foo": "baz",',
        depth: 1,
        path: ['foo', { deleted: true, value: 'baz' }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"foo": "bar",',
        depth: 1,
        path: ['foo', { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.ADD,
        str: '"added": "added key",',
        depth: 1,
        path: ['added', { deleted: false, value: 'added key' }],
      },
    ]);
  });

  it('excludes ChangeType.REMOVE on updates if the flag is set', () => {
    const a = {
      foo: 'baz',
    };

    const b = {
      foo: 'bar',
    };

    const result = diff(a, b, {
      include: ChangeType.UPDATE,
      showUpdatedOnly: true,
    });

    expect(result).toEqual([
      {
        type: ChangeType.UPDATE,
        str: '"foo": "bar",',
        depth: 1,
        path: ['foo', { deleted: false, value: 'bar' }],
      },
    ]);
  });

  it('excludes ChangeType', () => {
    const a = {
      foo: 'baz',
      bar: new Map([['foo', 'bar']]),
      test: new Set(['foo']),
    };

    const b = {
      foo: 'bar',
      bar: new Map([['foo', 'bar']]),
      test: new Set(['foo']),
    };

    const result = diff(a, b, {
      exclude: ChangeType.NOOP,
      showUpdatedOnly: true,
    });

    expect(result).toEqual([
      {
        type: ChangeType.UPDATE,
        str: '"foo": "bar",',
        depth: 1,
        path: ['foo', { deleted: false, value: 'bar' }],
      },
    ]);
  });

  it('loose type checks', () => {
    const a = {
      foo: '1',
      bar: '',
      baz: true,
    };

    const b = {
      foo: 1,
      bar: false,
      baz: 1,
    };

    const result = diff(a, b, {
      strict: false,
    });
    expect(result).toEqual([
      { type: ChangeType.NOOP, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.NOOP,
        str: '"foo": 1,',
        depth: 1,
        path: ['foo', { deleted: false, value: 1 }],
      },
      {
        type: ChangeType.NOOP,
        str: '"bar": false,',
        depth: 1,
        path: ['bar', { deleted: false, value: false }],
      },
      {
        type: ChangeType.NOOP,
        str: '"baz": 1,',
        depth: 1,
        path: ['baz', { deleted: false, value: 1 }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('correctly checks equality between objects', () => {
    const complex = () => {};
    const sameRef = new Set(['nested']);

    const a = {
      foo: 'bar',
      map: new Map([
        [complex, true],
        ['test', 1],
        ['foo', 'bar'],
        [sameRef, 'bar'],
      ]),
      set: new Set(['foo', 'bar']),
      arr: [1, 2, 3],
      big: 1n,
    };

    a.circular = a;

    const b = {
      foo: 'bar',
      map: new Map([
        ['foo', 'bar'],
        ['test', 1],
        [complex, true],
        [sameRef, 'bar'],
      ]),
      set: new Set(['bar', 'foo']),
      arr: [1, 2, 3],
      big: BigInt(1),
    };

    b.circular = b;

    expect(diff(a, b).equal).toEqual(true);

    const c = {
      foo: 'bar',
      test: '1',
      arr: ['1', 2, 3],
    };

    const d = {
      foo: 'bar',
      test: 1,
      arr: [1, '2', '3'],
    };

    // It also returns true for different data types but with loosely type checks
    expect(diff(c, d, { strict: false }).equal).toEqual(true);

    // If not loosely type checked, then it's false
    expect(diff(c, d).equal).toEqual(false);
  });

  it('changes the hint for Sets', () => {
    const a = new Set(['baz']);
    const b = new Set(['bar']);

    expect(diff(a, b, { pathHints: { set: '<SET>' } })).toEqual([
      { type: ChangeType.NOOP, str: 'Set [', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"baz",',
        depth: 1,
        path: ['<SET>', { deleted: true, value: 'baz' }],
      },
      {
        type: ChangeType.ADD,
        str: '"bar",',
        depth: 1,
        path: ['<SET>', { deleted: false, value: 'bar' }],
      },
      { type: ChangeType.NOOP, str: ']', depth: 0, path: [] },
    ]);

    expect(diff(a, b, { pathHints: { set: false } })).toEqual([
      { type: ChangeType.NOOP, str: 'Set [', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"baz",',
        depth: 1,
        path: [{ deleted: true, value: 'baz' }],
      },
      {
        type: ChangeType.ADD,
        str: '"bar",',
        depth: 1,
        path: [{ deleted: false, value: 'bar' }],
      },
      { type: ChangeType.NOOP, str: ']', depth: 0, path: [] },
    ]);
  });

  it('changes the hint for Maps', () => {
    const a = new Map([['foo', 'baz']]);
    const b = new Map([['foo', 'bar']]);

    expect(diff(a, b, { pathHints: { map: '{MAP}' } })).toEqual([
      { type: ChangeType.NOOP, str: 'Map (1) {', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"foo": "baz",',
        depth: 1,
        path: ['{MAP}', 'foo', { deleted: true, value: 'baz' }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"foo": "bar",',
        depth: 1,
        path: ['{MAP}', 'foo', { deleted: false, value: 'bar' }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);

    expect(diff(a, b, { pathHints: { map: false } })).toEqual([
      { type: ChangeType.NOOP, str: 'Map (1) {', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"foo": "baz",',
        depth: 1,
        path: ['foo', { deleted: true, value: 'baz' }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"foo": "bar",',
        depth: 1,
        path: ['foo', { deleted: false, value: 'bar' }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });
});
