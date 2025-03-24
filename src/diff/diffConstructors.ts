import { type DiffResult, DiffConstructorArgs } from '../types';
import { ChangeType } from '../utils/constants';
import { emptyShellClone, isObject } from '../utils/fns';

function diffConstructors({
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
}: DiffConstructorArgs): DiffResult[] {
  // Different Constructors
  let modLhs = lhs;
  let modRhs = rhs;
  let defaultChangeType = initialChangeType;

  if (isObject(rhs) || rhs?.constructor) {
    // Added in rhs. Use rhs prototype to traverse the added properties
    modLhs = emptyShellClone(rhs);

    defaultChangeType = ChangeType.ADD;
  } else if (isObject(lhs) || lhs?.constructor) {
    // Removed in rhs. Use lhs prototype to traverse the removed properties
    modRhs = emptyShellClone(lhs);

    defaultChangeType = ChangeType.REMOVE;
  } else {
    // Fail for unknown edge cases
    throw new Error("Edge case raised, I don't know how to handle this input");
  }

  return recursiveDiff({
    lhs: modLhs,
    rhs: modRhs,
    config,
    depth,
    parent,
    seen,
    initialChangeType: defaultChangeType,
    path,
    startedAt,
  });
}

export default diffConstructors;
