import { DiffResult, DiffSetArgs } from '../types';
import { ChangeType, ITERATION_TIMEOUT_CHECK } from '../utils/constants';
import { getRef, isIterable } from '../utils/fns';
import {
  buildResult,
  getPathHint,
  includeDiffType,
  lastPathValue,
  maxKeysSecurityCheck,
  timeoutSecurityCheck,
} from './shared';

function diffSets({
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
}: DiffSetArgs): DiffResult[] {
  const result: DiffResult[] = [];

  maxKeysSecurityCheck(lhs.size, config);
  maxKeysSecurityCheck(rhs.size, config);

  const mergedSet = new Set([...lhs, ...rhs]);

  let i = 0;
  for (const value of mergedSet) {
    if (i++ % ITERATION_TIMEOUT_CHECK === 0) {
      timeoutSecurityCheck(startedAt, config);
    }

    const existsInLhs = lhs.has(value);
    const existsInRhs = rhs.has(value);
    const hint = getPathHint(config, 'set');
    const updatedPath = [...path];

    if (hint) {
      updatedPath.push(hint);
    }

    if (isIterable(value)) {
      result.push(
        ...recursiveDiff({
          lhs: existsInLhs ? value : undefined,
          rhs: existsInRhs ? value : undefined,
          config,
          depth: depth + 1,
          parent: getRef(value),
          seen,
          initialChangeType,
          path: updatedPath,
          startedAt,
        })
      );
      continue;
    }

    let type = ChangeType.NOOP;

    if (existsInLhs && !existsInRhs) {
      type = ChangeType.REMOVE;
    } else if (!existsInLhs && existsInRhs) {
      type = ChangeType.ADD;
    }

    if (includeDiffType(type, config)) {
      result.push({
        type,
        str: `${JSON.stringify(value)},`,
        depth,
        path: [...updatedPath, lastPathValue(type, value)],
      });
    }
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

export default diffSets;
