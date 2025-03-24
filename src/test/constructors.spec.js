import diff, { ChangeType } from '..';

describe('Diff Constructors', () => {
  const expectedAdd = [
    { type: ChangeType.ADD, str: '{', depth: 0, path: [] },
    {
      type: ChangeType.ADD,
      str: '"foo": "bar",',
      depth: 1,
      path: ['foo', { deleted: false, value: 'bar' }],
    },
    { type: ChangeType.ADD, str: '}', depth: 0, path: [] },
  ];

  const expectRemove = [
    { type: ChangeType.REMOVE, str: '{', depth: 0, path: [] },
    {
      type: ChangeType.REMOVE,
      str: '"foo": "bar",',
      depth: 1,
      path: ['foo', { deleted: true, value: 'bar' }],
    },
    { type: ChangeType.REMOVE, str: '}', depth: 0, path: [] },
  ];

  it('uses rhs constructor and detects changes as added', () => {
    const a = ['bar'];
    const b = {
      foo: 'bar',
    };
    const c = undefined;
    const d = null;

    expect([diff(a, b), diff(c, b), diff(d, b)]).toContainEqual(expectedAdd);

    expect(diff(b, a)).toEqual([
      { type: ChangeType.ADD, str: '[', depth: 0, path: [] },
      {
        type: ChangeType.ADD,
        str: '0: "bar",',
        depth: 1,
        path: [0, { deleted: false, value: 'bar' }],
      },
      { type: ChangeType.ADD, str: ']', depth: 0, path: [] },
    ]);
  });

  it('detects the changes as removed when removed in lhs', () => {
    const a = {
      foo: 'bar',
    };
    const b = undefined;
    const c = null;

    expect([diff(a, b), diff(a, c)]).toContainEqual(expectRemove);
  });

  it('handles Object.create(null)', () => {
    const a = Object.create(null);
    a.foo = 'bar';
    const b = undefined;
    const c = null;

    expect([diff(a, b), diff(a, c)]).toContainEqual(expectRemove);
    expect([diff(b, a), diff(c, a)]).toContainEqual(expectedAdd);
  });

  it('detects constructor changes between Set and []', () => {
    const a = [];
    const b = new Set(['foo', 'bar']);

    expect(diff(a, b)).toEqual([
      { type: ChangeType.ADD, str: 'Set [', depth: 0, path: [] },
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
      { type: ChangeType.ADD, str: ']', depth: 0, path: [] },
    ]);
  });

  it('detects prototype changes when altered by Object.setPrototypeOf', () => {
    const a = { a: 1, b: 2 };
    const b = { a: 1, b: 2 };
    Object.setPrototypeOf(b, Array.prototype);

    expect(diff(a, b)).toEqual([
      { type: ChangeType.ADD, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.ADD,
        str: '"a": 1,',
        depth: 1,
        path: ['a', { deleted: false, value: 1 }],
      },
      {
        type: ChangeType.ADD,
        str: '"b": 2,',
        depth: 1,
        path: ['b', { deleted: false, value: 2 }],
      },
      { type: ChangeType.ADD, str: '}', depth: 0, path: [] },
    ]);
  });

  it('detects undefined and null as a valid values in constructor changes', () => {
    const a = undefined;
    const b = { foo: undefined };
    const c = { bar: null };

    expect(diff(a, b)).toEqual([
      { type: ChangeType.ADD, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.ADD,
        str: '"foo": undefined,',
        depth: 1,
        path: ['foo', { deleted: false, value: undefined }],
      },
      { type: ChangeType.ADD, str: '}', depth: 0, path: [] },
    ]);

    expect(diff(c, a)).toEqual([
      { type: ChangeType.REMOVE, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"bar": null,',
        depth: 1,
        path: ['bar', { deleted: true, value: null }],
      },
      { type: ChangeType.REMOVE, str: '}', depth: 0, path: [] },
    ]);
  });

  it('detects maps constructor changes on empty structures', () => {
    const a = {};
    const b = new Map();

    expect(diff(a, b)).toEqual([
      { type: ChangeType.ADD, str: 'Map (0) {', depth: 0, path: [] },
      { type: ChangeType.ADD, str: '}', depth: 0, path: [] },
    ]);

    expect(diff(b, null)).toEqual([
      { type: ChangeType.REMOVE, str: 'Map (0) {', depth: 0, path: [] },
      { type: ChangeType.REMOVE, str: '}', depth: 0, path: [] },
    ]);

    expect(diff(undefined, b)).toEqual([
      { type: ChangeType.ADD, str: 'Map (0) {', depth: 0, path: [] },
      { type: ChangeType.ADD, str: '}', depth: 0, path: [] },
    ]);
  });

  it('detects sets constructor changes on empty structures', () => {
    const a = [];
    const b = new Set();

    expect(diff(a, b)).toEqual([
      { type: ChangeType.ADD, str: 'Set [', depth: 0, path: [] },
      { type: ChangeType.ADD, str: ']', depth: 0, path: [] },
    ]);

    expect(diff(b, undefined)).toEqual([
      { type: ChangeType.REMOVE, str: 'Set [', depth: 0, path: [] },
      { type: ChangeType.REMOVE, str: ']', depth: 0, path: [] },
    ]);

    expect(diff(null, b)).toEqual([
      { type: ChangeType.ADD, str: 'Set [', depth: 0, path: [] },
      { type: ChangeType.ADD, str: ']', depth: 0, path: [] },
    ]);
  });

  it('detects objects constructor changes on empty structures', () => {
    const a = [];
    const b = {};

    expect(diff(a, b)).toEqual([
      { type: ChangeType.ADD, str: '{', depth: 0, path: [] },
      { type: ChangeType.ADD, str: '}', depth: 0, path: [] },
    ]);

    expect(diff(b, undefined)).toEqual([
      { type: ChangeType.REMOVE, str: '{', depth: 0, path: [] },
      { type: ChangeType.REMOVE, str: '}', depth: 0, path: [] },
    ]);
  });

  it('detects objects constructor changes on primitives', () => {
    const a = undefined;
    const b = 'testing';
    const c = false;
    const d = 123;
    const e = Symbol('foo');
    const f = BigInt(1);

    // Exactly the same primitive
    expect(diff(a, a)).toEqual([]);
    expect(diff(b, b)).toEqual([]);
    expect(diff(c, c)).toEqual([]);
    expect(diff(d, d)).toEqual([]);
    expect(diff(e, e)).toEqual([]);
    expect(diff(f, f)).toEqual([]);
    expect(diff('1', 1, { strict: false })).toEqual([]);

    expect(diff(a, b)).toEqual([
      {
        type: ChangeType.REMOVE,
        str: 'undefined',
        depth: 0,
        path: [{ deleted: true, value: undefined }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"testing"',
        depth: 0,
        path: [{ deleted: false, value: 'testing' }],
      },
    ]);

    expect(diff(a, c)).toEqual([
      {
        type: ChangeType.REMOVE,
        str: 'undefined',
        depth: 0,
        path: [{ deleted: true, value: undefined }],
      },
      {
        type: ChangeType.UPDATE,
        str: 'false',
        depth: 0,
        path: [{ deleted: false, value: false }],
      },
    ]);

    expect(diff(a, d)).toEqual([
      {
        type: ChangeType.REMOVE,
        str: 'undefined',
        depth: 0,
        path: [{ deleted: true, value: undefined }],
      },
      {
        type: ChangeType.UPDATE,
        str: '123',
        depth: 0,
        path: [{ deleted: false, value: 123 }],
      },
    ]);

    expect(diff(a, e)).toEqual([
      {
        type: ChangeType.REMOVE,
        str: 'undefined',
        depth: 0,
        path: [{ deleted: true, value: undefined }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"Symbol(foo)"',
        depth: 0,
        path: [{ deleted: false, value: e }],
      },
    ]);

    expect(diff(a, f)).toEqual([
      {
        type: ChangeType.REMOVE,
        str: 'undefined',
        depth: 0,
        path: [{ deleted: true, value: undefined }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"BigInt(1)"',
        depth: 0,
        path: [{ deleted: false, value: 1n }],
      },
    ]);
  });

  it('does not compare at character level', () => {
    const a = 'abc';
    const b = 'cba';

    expect(diff(a, b)).toEqual([
      {
        type: ChangeType.REMOVE,
        str: '"abc"',
        depth: 0,
        path: [{ deleted: true, value: 'abc' }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"cba"',
        depth: 0,
        path: [{ deleted: false, value: 'cba' }],
      },
    ]);
  });
});
