import { describe, it, expect } from 'vitest';
import {
  toCamelCase,
  toSnakeCase,
  camelCaseKeys,
  snakeCaseKeys,
  sha256Hash,
  truncate,
  capitalize,
} from './string';

describe('toCamelCase', () => {
  it('converts snake_case', () => {
    expect(toCamelCase('hello_world')).toBe('helloWorld');
  });
});

describe('toSnakeCase', () => {
  it('converts camelCase', () => {
    expect(toSnakeCase('helloWorld')).toBe('hello_world');
  });
});

describe('camelCaseKeys', () => {
  it('converts object keys to camelCase', () => {
    expect(camelCaseKeys({ first_name: 'John', last_name: 'Doe' })).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });
});

describe('snakeCaseKeys', () => {
  it('converts object keys to snake_case', () => {
    expect(snakeCaseKeys({ firstName: 'John', lastName: 'Doe' })).toEqual({
      first_name: 'John',
      last_name: 'Doe',
    });
  });
});

describe('sha256Hash', () => {
  it('returns consistent hash', () => {
    const hash = sha256Hash('test');
    expect(hash).toHaveLength(64);
    expect(sha256Hash('test')).toBe(hash);
  });

  it('truncates when specified', () => {
    expect(sha256Hash('test', 8)).toHaveLength(8);
  });
});

describe('truncate', () => {
  it('returns original if shorter than max', () => {
    expect(truncate('hi', 10)).toBe('hi');
  });

  it('truncates and adds suffix', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('returns empty string as-is', () => {
    expect(capitalize('')).toBe('');
  });
});
