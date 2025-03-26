import diff, { ChangeType } from '..';

describe('Diff Objects', () => {
  it('detects constructor change', () => {
    const a = undefined;
    const b = {};

    expect(diff(a, b)).toEqual([
      { type: ChangeType.ADD, str: '{', depth: 0, path: [] },
      { type: ChangeType.ADD, str: '}', depth: 0, path: [] },
    ]);
  });

  it('detects removal of null or undefined properties', () => {
    const a = { foo: undefined, bar: null };
    const b = {};

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"foo": undefined,',
        depth: 1,
        path: ['foo', { deleted: true, value: undefined }],
      },
      {
        type: ChangeType.REMOVE,
        str: '"bar": null,',
        depth: 1,
        path: ['bar', { deleted: true, value: null }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('supports Objects', () => {
    const a = { foo: 'baz', abc: 'test' };
    const b = { foo: 'bar' };

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: '{', depth: 0, path: [] },
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
      {
        type: ChangeType.REMOVE,
        str: '"abc": "test",',
        depth: 1,
        path: ['abc', { deleted: true, value: 'test' }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('supports new additions', () => {
    const a = { foo: 'bar' };
    const b = { foo: 'bar', ab: 'tst' };

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.NOOP,
        str: '"foo": "bar",',
        depth: 1,
        path: ['foo', { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.ADD,
        str: '"ab": "tst",',
        depth: 1,
        path: ['ab', { deleted: false, value: 'tst' }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('supports nested Objects', () => {
    const a = {
      foo: 'bar',
      data: {
        invalid: true,
      },
      address: {
        streetName: 'Test #123',
      },
    };
    const b = {
      user: {
        name: 'John Doe',
      },
      address: {
        streetName: 'Tst #321',
      },
      foo: 'bar',
    };

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.NOOP,
        str: '"foo": "bar",',
        depth: 1,
        path: ['foo', { deleted: false, value: 'bar' }],
      },
      {
        type: ChangeType.REMOVE,
        str: '"data": {',
        depth: 1,
        path: ['data'],
      },
      {
        type: ChangeType.REMOVE,
        str: '"invalid": true,',
        depth: 2,
        path: ['data', 'invalid', { deleted: true, value: true }],
      },
      {
        type: ChangeType.REMOVE,
        str: '},',
        depth: 1,
        path: ['data'],
      },
      {
        type: ChangeType.NOOP,
        str: '"address": {',
        depth: 1,
        path: ['address'],
      },
      {
        type: ChangeType.REMOVE,
        str: '"streetName": "Test #123",',
        depth: 2,
        path: ['address', 'streetName', { deleted: true, value: 'Test #123' }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"streetName": "Tst #321",',
        depth: 2,
        path: ['address', 'streetName', { deleted: false, value: 'Tst #321' }],
      },
      {
        type: ChangeType.NOOP,
        str: '},',
        depth: 1,
        path: ['address'],
      },
      {
        type: ChangeType.ADD,
        str: '"user": {',
        depth: 1,
        path: ['user'],
      },
      {
        type: ChangeType.ADD,
        str: '"name": "John Doe",',
        depth: 2,
        path: ['user', 'name', { deleted: false, value: 'John Doe' }],
      },
      {
        type: ChangeType.ADD,
        str: '},',
        depth: 1,
        path: ['user'],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('handles null and undefined values as updates, detects changes on frozen objects', () => {
    const a = Object.freeze({ foo: null, bar: undefined });
    const b = { foo: 'john', bar: 'doe' };

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"foo": null,',
        depth: 1,
        path: ['foo', { deleted: true, value: null }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"foo": "john",',
        depth: 1,
        path: ['foo', { deleted: false, value: 'john' }],
      },
      {
        type: ChangeType.REMOVE,
        str: '"bar": undefined,',
        depth: 1,
        path: ['bar', { deleted: true, value: undefined }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"bar": "doe",',
        depth: 1,
        path: ['bar', { deleted: false, value: 'doe' }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('handles symbol keys and values', () => {
    const symTest = Symbol('foo');
    const symBaz = Symbol('baz');
    const symBar = Symbol('bar');
    const a = { [symTest]: symBaz };
    const b = { [symTest]: symBar };

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"Symbol(foo)": "Symbol(baz)",',
        depth: 1,
        path: [symTest, { deleted: true, value: symBaz }],
      },
      {
        type: ChangeType.UPDATE,
        str: '"Symbol(foo)": "Symbol(bar)",',
        depth: 1,
        path: [symTest, { deleted: false, value: symBar }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('handles custom classes as objects', () => {
    class MyClassA {
      constructor() {
        this.foo = 'bar';
      }
    }

    class MyClassB {
      constructor() {
        this.bar = 'foo';
      }
    }

    const a = new MyClassA();
    const b = new MyClassB();
    const c = undefined;
    const d = null;

    expect([diff(a, b), diff(c, b), diff(d, b)]).toContainEqual([
      { type: ChangeType.ADD, str: 'MyClassB {', depth: 0, path: [] },
      {
        type: ChangeType.ADD,
        str: '"bar": "foo",',
        depth: 1,
        path: ['bar', { deleted: false, value: 'foo' }],
      },
      { type: ChangeType.ADD, str: '}', depth: 0, path: [] },
    ]);

    expect([diff(b, c), diff(b, d)]).toContainEqual([
      { type: ChangeType.REMOVE, str: 'MyClassB {', depth: 0, path: [] },
      {
        type: ChangeType.REMOVE,
        str: '"bar": "foo",',
        depth: 1,
        path: ['bar', { deleted: true, value: 'foo' }],
      },
      { type: ChangeType.REMOVE, str: '}', depth: 0, path: [] },
    ]);
  });

  it('handles circular references', () => {
    const a = {};
    const b = {};
    b.foo = b;

    expect(diff(a, b)).toEqual([
      { type: ChangeType.NOOP, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.ADD,
        str: '"foo": [Circular],',
        depth: 1,
        path: ['foo'],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('handles the same reference multiple times', () => {
    const sameRef = {};
    const a = {
      foo: sameRef,
      bar: sameRef,
    };

    expect(diff(undefined, a)).toEqual([
      { type: ChangeType.ADD, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.ADD,
        str: '"foo": {',
        depth: 1,
        path: ['foo'],
      },
      { type: ChangeType.ADD, str: '},', depth: 1, path: ['foo'] },
      {
        type: ChangeType.ADD,
        str: '"bar": {',
        depth: 1,
        path: ['bar'],
      },
      { type: ChangeType.ADD, str: '},', depth: 1, path: ['bar'] },
      { type: ChangeType.ADD, str: '}', depth: 0, path: [] },
    ]);
  });

  it('traverses the same object', () => {
    const a = { foo: 'bar' };

    expect(diff(a, a)).toEqual([
      { type: ChangeType.NOOP, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.NOOP,
        str: '"foo": "bar",',
        depth: 1,
        path: ['foo', { deleted: false, value: 'bar' }],
      },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });

  it('correctly compares new object entries vs undefined/null', () => {
    const a = {
      foo: undefined,
    };

    const b = {
      foo: null,
    };

    const c = {
      foo: {
        bar: 1,
      },
    };

    expect([diff(a, c), diff(b, c)]).toContainEqual([
      { type: ChangeType.NOOP, str: '{', depth: 0, path: [] },
      { type: ChangeType.ADD, str: '"foo": {', depth: 1, path: ['foo'] },
      {
        type: ChangeType.ADD,
        str: '"bar": 1,',
        depth: 2,
        path: ['foo', 'bar', { deleted: false, value: 1 }],
      },
      { type: ChangeType.ADD, str: '},', depth: 1, path: ['foo'] },
      { type: ChangeType.NOOP, str: '}', depth: 0, path: [] },
    ]);
  });
});
