import { Iterables } from './constants';

export function isPrimitive(value: any) {
  return value !== Object(value);
}

export function getRawValue(value: any) {
  // If value is primitive (except symbol), then perform validations in its pure form
  if (isPrimitive(value) && typeof value !== 'symbol') return value;

  // Serializes the value to perform validations
  return value.toString();
}

export function isNullOrUndefined(value: any) {
  return value === null || value === undefined;
}
export function isCustomClassInstance(object: any) {
  if (
    isNullOrUndefined(object) ||
    typeof object !== 'object' ||
    !object.constructor
  ) {
    return false;
  }

  return !object.constructor?.toString?.().includes('[native code]');
}

export function emptyShellClone(object: any) {
  // Clone the instance shell
  if (isCustomClassInstance(object)) {
    return Object.create(Object.getPrototypeOf(object));
  }

  // Objects created with Object.create(null) don't have constructor
  if (isObject(object)) {
    return Object.create(null);
  }

  // Creates an empty instance from the native constructor
  return new object.constructor();
}

export function getWrapper(obj: any) {
  let wrapper = ['{', '}'];

  if (Array.isArray(obj)) {
    wrapper = ['[', ']'];
  } else if (isCustomClassInstance(obj)) {
    wrapper = [`${obj.constructor.name} {`, '}'];
  } else if (obj instanceof Map) {
    wrapper = [`Map (${obj.size}) {`, '}'];
  } else if (obj instanceof Set) {
    wrapper = ['Set [', ']'];
  }

  return wrapper;
}

/**
 * Returns the ref type of the value
 * @param value - The value
 * @returns string
 */
export function getRef(value: any) {
  return `ref<${value?.constructor?.name || typeof value}>`;
}

export function isObject(obj: any) {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    (Object.getPrototypeOf(obj) === Object.prototype ||
      Object.getPrototypeOf(obj) === null)
  );
}

export function areObjects(a: any, b: any) {
  return isObject(a) && isObject(b);
}

export function getEnumerableKeys(obj: any) {
  return [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
}

export function isIterable(obj: any) {
  return (
    Iterables.has(obj?.constructor) ||
    isObject(obj) ||
    isCustomClassInstance(obj)
  );
}
