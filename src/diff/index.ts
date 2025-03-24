import { type DiffResult, RecursiveDiffArgs } from '../types';
import diffObjects from './diffObjects';
import diffSets from './diffSets';
import diffMaps from './diffMaps';
import diffConstructors from './diffConstructors';
import { ChangeType } from '../utils/constants';
import { areObjects, isNullOrUndefined, isPrimitive } from '../utils/fns';
import {
  createReplacer,
  includeDiffType,
  lastPathValue,
  timeoutSecurityCheck,
  stringify,
} from './shared';

function recursiveDiff({
  lhs,
  rhs,
  config,
  depth,
  parent,
  seen,
  initialChangeType,
  path,
  startedAt,
}: RecursiveDiffArgs): DiffResult[] {
  // Prevents stack overflow
  if (depth > config.maxDepth) {
    throw new Error('Max depth exceeded!');
  }

  // Checks for timeout before proceeding
  timeoutSecurityCheck(startedAt, config);

  // Allows printing the first level of circular references
  const lhsSeen = seen.get(lhs) ?? 0;
  const rhsSeen = seen.get(rhs) ?? 0;

  if (lhsSeen > 1 || rhsSeen > 1) {
    if (!includeDiffType(initialChangeType, config)) return [];

    return [
      {
        type: initialChangeType,
        str: `${stringify(parent, config)}: [Circular],`,
        depth: depth - 1,
        path,
      },
    ];
  }

  // Prevents circular references except for primitives
  if (typeof lhs === 'object' && lhs !== null) seen.set(lhs, lhsSeen + 1);
  if (typeof rhs === 'object' && rhs !== null) seen.set(rhs, rhsSeen + 1);

  const args = {
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
  };

  // Handles comparing primitives
  if (isPrimitive(lhs) && isPrimitive(rhs)) {
    // Return early if it's the same primitive
    if (config.strict ? lhs === rhs : lhs == rhs) {
      return [];
    }

    const parentDepth = depth - 1;
    const lhsValue = JSON.stringify(lhs, createReplacer(config));
    const rhsValue = JSON.stringify(rhs, createReplacer(config));

    const result = [];

    if (includeDiffType(ChangeType.UPDATE, config)) {
      if (!config.showUpdatedOnly) {
        result.push({
          type: ChangeType.REMOVE,
          str: `${lhsValue}`,
          depth: parentDepth,
          path: [...path, lastPathValue(ChangeType.REMOVE, lhs)],
        });
      }

      result.push({
        type: ChangeType.UPDATE,
        str: `${rhsValue}`,
        depth: parentDepth,
        path: [...path, lastPathValue(ChangeType.UPDATE, rhs)],
      });
    }

    return result;
  }

  // Different constructor handler
  if (
    !areObjects(lhs, rhs) && // Skips for Object.create(null) vs {}
    (lhs?.constructor !== rhs?.constructor ||
      (isNullOrUndefined(lhs) && rhs) ||
      (lhs && isNullOrUndefined(rhs)))
  ) {
    return diffConstructors(args);
  }

  // SETS
  if (lhs instanceof Set && rhs instanceof Set) {
    return diffSets(args);
  }

  // MAPS
  if (lhs instanceof Map && rhs instanceof Map) {
    return diffMaps(args);
  }

  // Arrays and Objects
  return diffObjects(args);
}

export default recursiveDiff;
