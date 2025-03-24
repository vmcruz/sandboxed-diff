import type { DiffConfig, DiffResult, PathHints } from '../types';
import { ChangeType, REDACTED } from '../utils/constants';
import { getRawValue, getWrapper } from '../utils/fns';

export function lastPathValue(changeType: ChangeType, value: any) {
  return { deleted: changeType === ChangeType.REMOVE, value };
}

export function includeDiffType(type: ChangeType, config: DiffConfig) {
  return config.include?.includes?.(type) && !config.exclude?.includes?.(type);
}

export function shouldRedactValue(key: any, config: DiffConfig) {
  const rawKey = getRawValue(key);

  return config.redactKeys?.includes?.(rawKey);
}

export function createReplacer(config: DiffConfig) {
  const seen = new WeakSet();

  return function replacer(k: any, v: any) {
    if (v && typeof v === 'object') {
      if (seen.has(v)) return '[Circular]';

      seen.add(v);
    }

    if (v instanceof Set) {
      return `Set ${JSON.stringify([...v.values()], replacer)}`;
    }

    if (v instanceof Map) {
      const entries = [...v.entries()];
      const stringified = entries
        .map(
          ([key, value]) =>
            `${JSON.stringify(key, replacer)}: ${JSON.stringify(shouldRedactValue(key, config) ? REDACTED : value, replacer)}`
        )
        .join(', ');

      return `Map (${entries.length}) { ${stringified} }`;
    }

    if (v instanceof Function) {
      return `Function ${v.name || '(anonymous)'}`;
    }

    if (typeof v === 'symbol') {
      return v.toString();
    }

    if (typeof v === 'bigint') {
      return `BigInt(${v.toString()})`;
    }

    return shouldRedactValue(k, config) ? REDACTED : v;
  };
}

export function stringify(obj: any, config: DiffConfig) {
  return JSON.stringify(obj, createReplacer(config));
}

export function getObjectChangeResult(
  lhs: any,
  rhs: any,
  depth: number,
  key: any,
  parsedKey: any,
  config: DiffConfig,
  path: Array<any>
) {
  const isLhsMap = lhs instanceof Map;
  const isRhsMap = rhs instanceof Map;

  let valueInLhs = lhs?.[key];
  let valueInRhs = rhs?.[key];
  let keyInLhs = Object.hasOwn(lhs, key);
  let keyInRhs = Object.hasOwn(rhs, key);

  if (isLhsMap) {
    valueInLhs = lhs.get(key);
    keyInLhs = lhs.has(key);
  }

  if (isRhsMap) {
    valueInRhs = rhs.get(key);
    keyInRhs = rhs.has(key);
  }

  const redactValue = shouldRedactValue(key, config);
  const rawValueInLhs = getRawValue(valueInLhs);
  const rawValueInRhs = getRawValue(valueInRhs);
  const formattedValueInLhs = JSON.stringify(
    redactValue ? REDACTED : rawValueInLhs,
    createReplacer(config)
  );
  const formattedValueInRhs = JSON.stringify(
    redactValue ? REDACTED : rawValueInRhs,
    createReplacer(config)
  );

  let type = ChangeType.NOOP;
  let formattedValue = formattedValueInRhs; // Select the most recent change
  let pathValue = valueInRhs;

  if (!keyInLhs && keyInRhs) {
    // added in rhs
    type = ChangeType.ADD;
  } else if (keyInLhs && !keyInRhs) {
    // removed in rhs
    type = ChangeType.REMOVE;
    formattedValue = formattedValueInLhs;
    pathValue = valueInLhs;
  } else if (
    config.strict
      ? rawValueInLhs !== rawValueInRhs
      : rawValueInLhs != rawValueInRhs
  ) {
    // different in rhs
    type = ChangeType.UPDATE;
  }

  const result: DiffResult[] = [];

  // If the type of change should be included in the results
  if (includeDiffType(type, config)) {
    if (type === ChangeType.UPDATE && !config.showUpdatedOnly) {
      result.push({
        type: ChangeType.REMOVE,
        str: `${JSON.stringify(parsedKey, createReplacer(config))}: ${formattedValueInLhs},`,
        depth,
        path: [...path, lastPathValue(ChangeType.REMOVE, valueInLhs)],
      });
    }

    result.push({
      type,
      str: `${JSON.stringify(parsedKey, createReplacer(config))}: ${formattedValue},`,
      depth,
      path: [...path, lastPathValue(type, pathValue)],
    });
  }

  return result;
}

export function getPathHint(config: DiffConfig, type: keyof PathHints) {
  if (typeof config.pathHints === 'object') {
    const hint = config.pathHints[type];

    if (typeof hint === 'string') return hint;
  }

  // no hint for this type
  return null;
}

export function buildResult(
  rhs: any,
  result: DiffResult[],
  depth: number,
  initialChangeType: ChangeType,
  parent: any,
  path: any[],
  config: DiffConfig
) {
  if (!includeDiffType(initialChangeType, config)) return result;

  const parentDepth = depth - 1;
  const [open, close] = getWrapper(rhs);

  return [
    {
      type: initialChangeType,
      str: parentDepth > 0 ? `${stringify(parent, config)}: ${open}` : open,
      depth: parentDepth,
      path,
    },
    ...result,
    {
      type: initialChangeType,
      str: parentDepth > 0 ? `${close},` : close,
      depth: parentDepth,
      path,
    },
  ];
}

// Prevents bloating the memory for large objects
export function timeoutSecurityCheck(startedAt: number, config: DiffConfig) {
  if (Date.now() - startedAt > config.timeout) {
    throw new Error('Diff took too much time! Aborting.');
  }
}

export function maxKeysSecurityCheck(size: number, config: DiffConfig) {
  if (size > config.maxKeys) {
    throw new Error('Object is too big to continue! Aborting.');
  }
}
