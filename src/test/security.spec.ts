/* eslint-disable jest/no-conditional-expect */
import diff, { ChangeType } from '..';

describe('Security checks', () => {
  const deep = {};
  const bigObj = { inner: { nested: {} } };
  let temp = deep;

  // warmup
  for (let i = 0; i < 1e5; i++) {
    // @ts-expect-error mimics deep nesting
    temp = temp.nested = {};

    // @ts-expect-error mimics deep nesting
    bigObj.inner.nested[`key${i}`] = i;
  }

  it('prevents prototype pollution', () => {
    const a = JSON.parse('{ "__proto__": { "pollution": true } }');
    const b = {};

    diff(a, b);
    // @ts-expect-error expects object pollution
    expect({}.pollution).not.toEqual(true);
  });

  it('prevents DoS via deep recursion', () => {
    expect(() => diff(deep, {})).toThrow('Max depth exceeded!');
  });

  it('prevents DoS via large objects', () => {
    // max timeout by default is 1s, adjusting not to run for too long
    const start = performance.now();

    try {
      diff(bigObj, {}, { timeout: 100, maxKeys: 1e5 });

      throw new Error('Timeout was not triggered!');
    } catch (e) {
      expect(performance.now() - start).toBeLessThan(150);
      expect((e as Error).message).toEqual(
        'Diff took too much time! Aborting.'
      );
    }
  });

  it('prevents DoS via large key objects', () => {
    expect(() => diff(bigObj, {}, { maxKeys: 1000 })).toThrow(
      'Object is too big to continue! Aborting.'
    );

    const a = new Map([
      ['foo', 'bar'],
      ['hello', 'world'],
    ]);

    const b = new Set(['foo', 'bar', 'hello', 'world']);

    expect(() => diff(a, undefined, { maxKeys: 1 })).toThrow(
      'Object is too big to continue! Aborting.'
    );

    expect(() => diff(b, undefined, { maxKeys: 3 })).toThrow(
      'Object is too big to continue! Aborting.'
    );
  });

  it('redacts sensitive information', () => {
    const symPassword = Symbol('password');
    const symToken = Symbol('token');
    const symSecret = Symbol('secret');

    const a = {
      password: 'abcde',
      token: 'abcde',
      secret: 'abcde',
      [symPassword]: 'abcde',
      [symToken]: 'abcde',
      [symSecret]: 'abcde',
      safe: 'safe field',
      sensitive: 'secret',
    };

    const b = new Map([[a, 'foo']]);
    const config = {
      redactKeys: [
        'password',
        'secret',
        'token',
        'Symbol(password)',
        'Symbol(secret)',
        'Symbol(token)',
        'sensitive',
      ],
    };

    expect(diff(undefined, a, config)).toEqual([
      { type: ChangeType.ADD, str: '{', depth: 0, path: [] },
      {
        type: ChangeType.ADD,
        str: '"password": "*****",',
        depth: 1,
        path: ['password', { deleted: false, value: 'abcde' }],
      },
      {
        type: ChangeType.ADD,
        str: '"token": "*****",',
        depth: 1,
        path: ['token', { deleted: false, value: 'abcde' }],
      },
      {
        type: ChangeType.ADD,
        str: '"secret": "*****",',
        depth: 1,
        path: ['secret', { deleted: false, value: 'abcde' }],
      },
      {
        type: ChangeType.ADD,
        str: '"safe": "safe field",',
        depth: 1,
        path: ['safe', { deleted: false, value: 'safe field' }],
      },
      {
        type: ChangeType.ADD,
        str: '"sensitive": "*****",',
        depth: 1,
        path: ['sensitive', { deleted: false, value: 'secret' }],
      },
      {
        type: ChangeType.ADD,
        str: '"Symbol(password)": "*****",',
        depth: 1,
        path: [symPassword, { deleted: false, value: 'abcde' }],
      },
      {
        type: ChangeType.ADD,
        str: '"Symbol(token)": "*****",',
        depth: 1,
        path: [symToken, { deleted: false, value: 'abcde' }],
      },
      {
        type: ChangeType.ADD,
        str: '"Symbol(secret)": "*****",',
        depth: 1,
        path: [symSecret, { deleted: false, value: 'abcde' }],
      },
      { type: ChangeType.ADD, str: '}', depth: 0, path: [] },
    ]);

    expect(diff(undefined, b, config)).toEqual([
      { type: ChangeType.ADD, str: 'Map (1) {', depth: 0, path: [] },
      {
        type: ChangeType.ADD,
        str: '{"password":"*****","token":"*****","secret":"*****","safe":"safe field","sensitive":"*****"}: "foo",',
        depth: 1,
        path: ['__MAP__', a, { deleted: false, value: 'foo' }],
      },
      { type: ChangeType.ADD, str: '}', depth: 0, path: [] },
    ]);
  });
});
