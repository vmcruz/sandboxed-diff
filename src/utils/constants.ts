export const Iterables = new Set([Object, Array, Set, Map]);

export enum ChangeType {
  ADD = 'add',
  UPDATE = 'update',
  REMOVE = 'remove',
  NOOP = 'noop',
}

export const DefaultPathHints = {
  map: '__MAP__',
  set: '__SET__',
};

export const MAX_DEPTH = 50;

export const MAX_KEYS = 1000;

export const ITERATION_TIMEOUT_CHECK = 1000;

export const MAX_TIMEOUT_MS = 1000;

export const REDACTED = '*****';
