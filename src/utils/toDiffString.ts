import type { DiffResult, DiffStringConfig } from '../types';
import { ChangeType } from './constants';

const ANSI_RESET = '\x1b[0m';

function colorWrapper(color: string) {
  return (str: string) => `${color}${str}${ANSI_RESET}`;
}

const ansiColors = {
  [ChangeType.REMOVE]: colorWrapper('\x1b[31m'),
  [ChangeType.ADD]: colorWrapper('\x1b[32m'),
  [ChangeType.UPDATE]: colorWrapper('\x1b[33m'),
  [ChangeType.NOOP]: colorWrapper(''),
};

/**
 * Takes the diff result and returns a diff string in md. + Added, - Removed, ! Updated
 * @param {DiffResult[]} diff - The result from the diff
 * @param {DiffStringConfig} [config]
 * @param {DiffStringConfig['withColors']} [config.withColors=true] - If true, outputs the string formatted with AnsiColors
 * @param {DiffStringConfig['colors']} [config.colors] - Each function takes a string and returns it formatted with ansi colors. Maps to each ChangeType.
 * @param {DiffStringConfig['symbols']} [config.symbols] - String map for each ChangeType
 * @param {DiffStringConfig['wrapper']} [config.wrapper=['```diff', '```']] - Strings that wrap the diff string output
 * @param {DiffStringConfig['indentSize']} [config.indentSize=2]
 */
export default function toDiffString(
  diff: DiffResult[],
  config?: DiffStringConfig
) {
  const defaultConfig: DiffStringConfig = {
    withColors: true,
    colors: ansiColors,
    wrapper: [],
    indentSize: 2,
    symbols: {
      [ChangeType.ADD]: '+',
      [ChangeType.REMOVE]: '-',
      [ChangeType.UPDATE]: '!',
      [ChangeType.NOOP]: '',
    },
  };

  const mergedConfig = {
    ...defaultConfig,
    ...config,
    colors: {
      ...defaultConfig.colors,
      ...config?.colors,
    },
    symbols: {
      ...defaultConfig.symbols,
      ...config?.symbols,
    },
  };

  const diffString = diff
    .map(({ type, str, depth }, index) => {
      let symbolString = mergedConfig.symbols[type];

      if (index > 0 && index < diff.length - 1 && !symbolString.length) {
        symbolString = ` ${mergedConfig.symbols[type]}`;
      }

      let buildStr = `${symbolString}${' '.repeat(depth * mergedConfig.indentSize)}${str}`;

      if (mergedConfig.withColors) {
        buildStr = mergedConfig.colors[type](buildStr);
      }

      return buildStr;
    })
    .join('\n');

  const [open = '', close = ''] = mergedConfig.wrapper || [];

  return `${open ? `${open}\n` : ''}${diffString}${close ? `\n${close}` : ''}`;
}
