import { type DiffResult, DiffObjectArgs } from '../types';
import { ITERATION_TIMEOUT_CHECK } from '../utils/constants';
import { getEnumerableKeys, isIterable } from '../utils/fns';
import {
  buildResult,
  getObjectChangeResult,
  maxKeysSecurityCheck,
  shouldRedactValue,
  timeoutSecurityCheck,
} from './shared';

function diffObjects({
  recursiveDiff,
  lhs,
  rhs,
  config,
  depth,
  parent,
  seen,
  initialChangeType,
  path,
  startedAt,
}: DiffObjectArgs): DiffResult[] {
  const result: DiffResult[] = [];

  const lhsKeys = getEnumerableKeys(lhs);
  maxKeysSecurityCheck(lhsKeys.length, config);

  const rhsKeys = getEnumerableKeys(rhs);
  maxKeysSecurityCheck(rhsKeys.length, config);

  const keys = new Set<string | number | symbol>([...lhsKeys, ...rhsKeys]);

  let i = 0;
  for (const key of keys) {
    if (i++ % ITERATION_TIMEOUT_CHECK === 0) {
      timeoutSecurityCheck(startedAt, config);
    }

    const redactable = shouldRedactValue(key, config);
    const lhsValue = Array.isArray(lhs) ? lhs[key as number] : lhs?.[key];
    const rhsValue = Array.isArray(rhs) ? rhs[key as number] : rhs?.[key];
    const numericKey = typeof key !== 'symbol' ? Number(key) : NaN;
    const parsedKey = isNaN(numericKey) ? key : numericKey;
    const updatedPath = [...path, parsedKey];

    if (!redactable && (isIterable(lhsValue) || isIterable(rhsValue))) {
      result.push(
        ...recursiveDiff({
          lhs: lhsValue,
          rhs: rhsValue,
          config,
          depth: depth + 1,
          parent: parsedKey,
          seen,
          initialChangeType,
          path: updatedPath,
          startedAt,
        })
      );
      continue;
    }

    result.push(
      ...getObjectChangeResult(
        lhs,
        rhs,
        depth,
        key,
        parsedKey,
        config,
        updatedPath
      )
    );
  }

  seen.delete(lhs);
  seen.delete(rhs);

  return buildResult(
    rhs,
    result,
    depth,
    initialChangeType,
    parent,
    path,
    config
  );
}

export default diffObjects;
