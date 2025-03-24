import { DiffResult, DiffMapArgs } from '../types';
import { ITERATION_TIMEOUT_CHECK } from '../utils/constants';
import { isIterable } from '../utils/fns';
import {
  buildResult,
  getObjectChangeResult,
  getPathHint,
  maxKeysSecurityCheck,
  timeoutSecurityCheck,
} from './shared';

function diffMaps({
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
}: DiffMapArgs): DiffResult[] {
  const result: DiffResult[] = [];

  maxKeysSecurityCheck(lhs.size, config);
  maxKeysSecurityCheck(rhs.size, config);

  const mergedMapKeys = new Set([...lhs.keys(), ...rhs.keys()]);

  let i = 0;
  for (const key of mergedMapKeys) {
    if (i++ % ITERATION_TIMEOUT_CHECK === 0) {
      timeoutSecurityCheck(startedAt, config);
    }

    const keyInLhs = lhs.has(key);
    const keyInRhs = rhs.has(key);
    const lhsValue = keyInLhs ? lhs.get(key) : null;
    const rhsValue = keyInRhs ? rhs.get(key) : null;
    const hint = getPathHint(config, 'map');
    const pathUpdate = hint ? [hint, key] : [key];
    const updatedPath = [...path, ...pathUpdate];

    if (isIterable(lhsValue) || isIterable(rhsValue)) {
      result.push(
        ...recursiveDiff({
          lhs: lhsValue,
          rhs: rhsValue,
          config,
          depth: depth + 1,
          parent: key,
          seen,
          initialChangeType,
          path: updatedPath,
          startedAt,
        })
      );
      continue;
    }

    result.push(
      ...getObjectChangeResult(lhs, rhs, depth, key, key, config, updatedPath)
    );
  }

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

export default diffMaps;
