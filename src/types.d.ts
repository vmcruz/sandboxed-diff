import { ChangeType } from './utils/constants';

export type DiffResult = {
  /** One of: add | remove | update | noop */
  type: ChangeType;
  /** The stringified portion of the object for this change */
  str: string;
  /** The path depth that this portion of the object is in */
  depth: number;
  /** Traversed path */
  path: Array<any>;
};

type DiffSymbols = Record<ChangeType, string>;
type DiffColors = Record<ChangeType, (str: string) => string>;

export type PathHints = {
  map: string;
  set: string;
};

export type DiffConfig = {
  /** Indicates which ChangeTypes should be logged in the diff output */
  include: ChangeType | ChangeType[];

  /** Indicates which ChangeTypes should be excluded from the diff output */
  exclude: ChangeType | ChangeType[];

  /** Enables loose type check. If `false`, then comparisons will be made with `==` */
  strict: boolean;

  /**
   * If false, it will log a `remove` operation for every `update`.
   * The `remove` operation reflects the original line being updated.
   */
  showUpdatedOnly: boolean;

  /**
   * Strings to use as hints for Sets and Maps in the path array
   */
  pathHints: PathHints;

  /**
   * Max recursion depth
   */
  maxDepth: number;

  /**
   * Max key size
   */
  maxKeys: number;

  /**
   * Timeout in milliseconds
   */
  timeout: number;

  /**
   * Obfuscates the values of the matched keys. Works well with: strings and serialized Symbols
   */
  redactKeys: Array<string>;
};

export interface RecursiveDiffArgs {
  lhs: any;
  rhs: any;
  config: DiffConfig;
  depth: number;
  parent: any;
  seen: WeakMap<object, number>;
  initialChangeType: ChangeType;
  path: Array<any>;
  startedAt: number;
}

export interface DiffMethodArgs extends RecursiveDiffArgs {
  recursiveDiff: (args: RecursiveDiffArgs) => DiffResult[];
}

export interface DiffMapArgs extends DiffMethodArgs {
  lhs: Map<any, any>;
  rhs: Map<any, any>;
}

export interface DiffSetArgs extends DiffMethodArgs {
  lhs: Set<any>;
  rhs: Set<any>;
}

export interface DiffObjectArgs extends DiffMethodArgs {
  lhs: { [key: string | number | symbol]: any } | any[];
  rhs: { [key: string | number | symbol]: any } | any[];
}

export interface DiffConstructorArgs extends DiffMethodArgs {
  lhs: any;
  rhs: any;
}

export type DiffStringConfig = {
  withColors: boolean;
  indentSize: number;
  wrapper: Array<string>;
  colors: DiffColors;
  symbols: DiffSymbols;
};

export interface Diff extends Array<DiffResult> {
  /** String formatted with the Github's `diff` md format */
  toDiffString: (config?: DiffStringConfig) => string;

  /** lsh and rhs are structurally equal */
  equal: boolean;
}
