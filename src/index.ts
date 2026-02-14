import recursiveDiff from './diff';
import type {
  DiffConfig,
  DiffStringConfig,
  Diff,
  DiffResult,
  DiffColors,
  DiffSymbols,
} from './types';
import {
  ChangeType,
  DefaultPathHints,
  MAX_DEPTH,
  MAX_KEYS,
  MAX_TIMEOUT_MS,
} from './utils/constants';
import toDiffString from './utils/toDiffString';

/**
 * Returns the deep difference between two objects. The return object contains the stringified difference for easy rendering.
 * @param {any} lhs - Lef-hand side object. Can be either Object, Array, Set or Map.
 * @param {any} rhs - Right-hand side object.
 * @param {DiffConfig} [config] - Configuration to be used
 * @param {DiffConfig['exclude']} [config.exclude=[]] - Type differences to be ignored.
 * @param {DiffConfig['include']} [config.include=['add', 'remove', 'update', 'noop']] - Type differences to be logged.
 * @param {DiffConfig['strict']} [config.strict=true] - Indicates whether to enforce type check.
 * @param {DiffConfig['showUpdatedOnly']} [config.showUpdatedOnly=false] - Indicates whether a `remove` operation should be included for every `update`
 * @param {DiffConfig['pathHints']} [config.pathHints={ map: '__MAP__', set: '__SET__' }] - Strings to use as hints for Sets and Maps in the path array
 * @param {DiffConfig['maxDepth']} [config.maxDepth=50] - Max recursive depth that can be traversed before throwing
 * @param {DiffConfig['maxKeys']} [config.maxKeys=1000] - Max keys that can be processed at a time. Throws when LHS + RHS keys > maxKeys
 * @param {DiffConfig['timeout']} [config.timeout=1000] - Throws when the diffing timeout is met
 * @param {DiffConfig['redactKeys']} [config.redactKeys=[]] - Replaces the values of these keys with *****
 */
function diff(lhs: any, rhs: any, config?: Partial<DiffConfig>): Diff {
  const defaultConfig: DiffConfig = {
    include: [
      ChangeType.ADD,
      ChangeType.REMOVE,
      ChangeType.UPDATE,
      ChangeType.NOOP,
    ],
    exclude: [],
    strict: true,
    showUpdatedOnly: false,
    pathHints: {
      map: DefaultPathHints.map,
      set: DefaultPathHints.set,
    },
    maxDepth: MAX_DEPTH,
    maxKeys: MAX_KEYS,
    timeout: MAX_TIMEOUT_MS,
    redactKeys: [
      'password',
      'secret',
      'token',
      'Symbol(password)',
      'Symbol(secret)',
      'Symbol(token)',
    ],
  };

  const mergedConfig: DiffConfig = {
    ...defaultConfig,
    ...config,
  };

  if (!mergedConfig.maxDepth) mergedConfig.maxDepth = MAX_DEPTH;
  if (!mergedConfig.maxKeys) mergedConfig.maxKeys = MAX_KEYS;
  if (!mergedConfig.timeout) mergedConfig.timeout = MAX_TIMEOUT_MS;

  mergedConfig.include = Array.isArray(mergedConfig.include)
    ? mergedConfig.include
    : [mergedConfig.include];

  mergedConfig.exclude = Array.isArray(mergedConfig.exclude)
    ? mergedConfig.exclude
    : [mergedConfig.exclude];

  const diffResult = recursiveDiff({
    lhs,
    rhs,
    config: mergedConfig,
    depth: 1,
    parent: null,
    seen: new WeakMap(),
    initialChangeType: ChangeType.NOOP,
    path: [],
    startedAt: Date.now(),
  });

  // All the changes are "noop", or empty array
  const areEqual = diffResult.every(
    (result) => result.type === ChangeType.NOOP
  );

  Object.defineProperty(diffResult, 'toDiffString', {
    value: (diffStringConfig: DiffStringConfig) =>
      toDiffString(diffResult, diffStringConfig),
    enumerable: false,
    writable: false,
    configurable: false,
  });

  Object.defineProperty(diffResult, 'equal', {
    value: areEqual,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return diffResult as Diff;
}

export { ChangeType, DiffResult, DiffColors, DiffSymbols };

export default diff;
