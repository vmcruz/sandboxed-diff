import diff, { ChangeType } from '..';

describe('Diff Arrays', () => {
  it('supports Arrays', () => {
    const a = [1, 2];
    const b = ['foo', 'bar'];

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: '[', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '0: 1,',
        depth: 1,
        path: [0, { deleted: true, value: 1 }],
      },
      {
        type: ChangeType.UPDATE,
        str: '0: "foo",',
        depth: 1,
        path: [0, { deleted: false, value: 'foo' }],
      },
      {
        type: ChangeType.REMOVE,
        str: '1: 2,',
        depth: 1,
        path: [1, { deleted: true, value: 2 }],
      },
      {
        type: ChangeType.UPDATE,
        str: '1: "bar",',
        depth: 1,
        path: [1, { deleted: false, value: 'bar' }],
      },
      { type: ChangeType.NOOP, str: ']', depth: 0, path: [] },
    ]);
  });

  it('supports new additions', () => {
    const a = ['foo'];
    const b = ['foo', 'bar'];

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: '[', depth: 0, path: [] },
      {
        type: ChangeType.NOOP,
        str: '0: "foo",',
        depth: 1,
        path: [0, { deleted: false, value: 'foo' }],
      },
      {
        type: ChangeType.ADD,
        str: '1: "bar",',
        depth: 1,
        path: [1, { deleted: false, value: 'bar' }],
      },
      { type: ChangeType.NOOP, str: ']', depth: 0, path: [] },
    ]);
  });

  it('supports nested Arrays', () => {
    const a = [1, ['test']];
    const b = [1, ['foo', 'bar'], [['test'], 1]];

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: '[', depth: 0, path: [] },
      {
        type: ChangeType.NOOP,
        str: '0: 1,',
        depth: 1,
        path: [0, { deleted: false, value: 1 }],
      },
      {
        type: ChangeType.NOOP,
        str: '1: [',
        depth: 1,
        path: [1],
      },
      {
        type: ChangeType.REMOVE,
        str: '0: "test",',
        depth: 2,
        path: [1, 0, { deleted: true, value: 'test' }],
      },
      {
        type: ChangeType.UPDATE,
        str: '0: "foo",',
        depth: 2,
        path: [1, 0, { deleted: false, value: 'foo' }],
      },
      {
        type: ChangeType.ADD,
        str: '1: "bar",',
        depth: 2,
        path: [1, 1, { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.NOOP,
        str: '],',
        depth: 1,
        path: [1],
      },
      {
        type: ChangeType.ADD,
        str: '2: [',
        depth: 1,
        path: [2],
      },
      {
        type: ChangeType.ADD,
        str: '0: [',
        depth: 2,
        path: [2, 0],
      },
      {
        type: ChangeType.ADD,
        str: '0: "test",',
        depth: 3,
        path: [2, 0, 0, { deleted: false, value: 'test' }],
      },
      {
        type: ChangeType.ADD,
        str: '],',
        depth: 2,
        path: [2, 0],
      },
      {
        type: ChangeType.ADD,
        str: '1: 1,',
        depth: 2,
        path: [2, 1, { deleted: false, value: 1 }],
      },
      {
        type: ChangeType.ADD,
        str: '],',
        depth: 1,
        path: [2],
      },
      {
        type: ChangeType.NOOP,
        str: ']',
        depth: 0,
        path: [],
      },
    ]);
  });

  it('handles sparse arrays', () => {
    // eslint-disable-next-line no-sparse-arrays
    const a = [1, , 3];
    const b = [1, undefined, 3, 4];

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: '[', depth: 0, path: [] },
      {
        type: ChangeType.NOOP,
        str: '0: 1,',
        depth: 1,
        path: [0, { deleted: false, value: 1 }],
      },
      // (empty) is ignored, as there isn't key '1' in a
      {
        type: ChangeType.NOOP,
        str: '2: 3,',
        depth: 1,
        path: [2, { deleted: false, value: 3 }],
      },
      {
        type: ChangeType.ADD,
        str: '1: undefined,',
        depth: 1,
        path: [1, { deleted: false, value: undefined }],
      },
      {
        type: ChangeType.ADD,
        str: '3: 4,',
        depth: 1,
        path: [3, { deleted: false, value: 4 }],
      },
      { type: ChangeType.NOOP, str: ']', depth: 0, path: [] },
    ]);
  });

  it('correctly compares primitives', () => {
    const symFoo = Symbol('foo');
    const symBar = Symbol('bar');
    const a = [1n, false, 'foo', null, symFoo];
    const b = [1n, true, 'bar', undefined, symBar];

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: '[', depth: 0, path: [] },
      {
        type: ChangeType.NOOP,
        str: '0: "BigInt(1)",',
        depth: 1,
        path: [0, { deleted: false, value: 1n }],
      },
      {
        type: ChangeType.REMOVE,
        str: '1: false,',
        depth: 1,
        path: [1, { deleted: true, value: false }],
      },
      {
        type: ChangeType.UPDATE,
        str: '1: true,',
        depth: 1,
        path: [1, { deleted: false, value: true }],
      },
      {
        type: ChangeType.REMOVE,
        str: '2: "foo",',
        depth: 1,
        path: [2, { deleted: true, value: 'foo' }],
      },
      {
        type: ChangeType.UPDATE,
        str: '2: "bar",',
        depth: 1,
        path: [2, { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.REMOVE,
        str: '3: null,',
        depth: 1,
        path: [3, { deleted: true, value: null }],
      },
      {
        type: ChangeType.UPDATE,
        str: '3: undefined,',
        depth: 1,
        path: [3, { deleted: false, value: undefined }],
      },
      {
        type: ChangeType.REMOVE,
        str: '4: "Symbol(foo)",',
        depth: 1,
        path: [4, { deleted: true, value: symFoo }],
      },
      {
        type: ChangeType.UPDATE,
        str: '4: "Symbol(bar)",',
        depth: 1,
        path: [4, { deleted: false, value: symBar }],
      },
      { type: ChangeType.NOOP, str: ']', depth: 0, path: [] },
    ]);
  });
});
