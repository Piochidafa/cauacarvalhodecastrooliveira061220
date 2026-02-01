import { beforeEach, describe, expect, it } from 'vitest';
import { cookieUtils } from '../cookies';

const clearCookies = () => {
  const cookies = document.cookie.split(';');
  cookies.forEach((cookie) => {
    const [name] = cookie.split('=');
    if (name) {
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
  });
};

describe('cookieUtils', () => {
  beforeEach(() => {
    clearCookies();
  });

  it('set and get returns value', () => {
    cookieUtils.set('token', 'abc', 1);
    expect(cookieUtils.get('token')).toBe('abc');
  });

  it('get returns null when missing', () => {
    expect(cookieUtils.get('missing')).toBeNull();
  });

  it('remove clears cookie', () => {
    cookieUtils.set('token', 'abc', 1);
    cookieUtils.remove('token');
    expect(cookieUtils.get('token')).toBeNull();
  });

  it('set overrides existing value', () => {
    cookieUtils.set('token', 'abc', 1);
    cookieUtils.set('token', 'def', 1);
    expect(cookieUtils.get('token')).toBe('def');
  });

  it('set uses provided name', () => {
    cookieUtils.set('refreshToken', 'r1', 1);
    expect(cookieUtils.get('refreshToken')).toBe('r1');
  });
});
