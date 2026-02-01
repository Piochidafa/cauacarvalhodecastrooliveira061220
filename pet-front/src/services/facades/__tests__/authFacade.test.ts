import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cookieUtils } from '../../../utils/cookies';

const authApiMocks = vi.hoisted(() => ({
  apiPost: vi.fn(),
  refreshPost: vi.fn()
}));

vi.mock('../../api/axiosConfig', () => ({
  default: { post: authApiMocks.apiPost },
  refreshApi: { post: authApiMocks.refreshPost }
}));

import { authFacade } from '../authFacade';

const clearCookies = () => {
  const cookies = document.cookie.split(';');
  cookies.forEach((cookie) => {
    const [name] = cookie.split('=');
    if (name) {
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
  });
};

describe('authFacade', () => {
  beforeEach(() => {
    authApiMocks.apiPost.mockReset();
    authApiMocks.refreshPost.mockReset();
    localStorage.clear();
    clearCookies();
  });

  it('login stores access token and refresh token', async () => {
    authApiMocks.apiPost.mockResolvedValue({
      data: { accessToken: 'a1', refreshToken: 'r1', expiresIn: 60 }
    });

    await authFacade.login({ username: 'u', password: 'p' });

    expect(localStorage.getItem('accessToken')).toBe('a1');
    expect(cookieUtils.get('refreshToken')).toBe('r1');
  });

  it('login stores access token expiration', async () => {
    authApiMocks.apiPost.mockResolvedValue({
      data: { accessToken: 'a1', expiresIn: 60 }
    });

    await authFacade.login({ username: 'u', password: 'p' });

    const expiresAt = localStorage.getItem('accessTokenExpiresAt');
    expect(expiresAt).not.toBeNull();
  });

  it('login returns response data', async () => {
    authApiMocks.apiPost.mockResolvedValue({
      data: { accessToken: 'a1', refreshToken: 'r1' }
    });

    const result = await authFacade.login({ username: 'u', password: 'p' });

    expect(result.accessToken).toBe('a1');
  });

  it('logout clears storage and cookie', async () => {
    authApiMocks.apiPost.mockResolvedValue({ data: {} });
    localStorage.setItem('accessToken', 'a1');
    localStorage.setItem('accessTokenExpiresAt', '123');
    cookieUtils.set('refreshToken', 'r1', 1);

    await authFacade.logout();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('accessTokenExpiresAt')).toBeNull();
    expect(cookieUtils.get('refreshToken')).toBeNull();
  });

  it('isAuthenticated returns true when token exists', () => {
    localStorage.setItem('accessToken', 'a1');
    expect(authFacade.isAuthenticated()).toBe(true);
  });

  it('isAuthenticated returns false when token missing', () => {
    expect(authFacade.isAuthenticated()).toBe(false);
  });

  it('getToken returns stored token', () => {
    localStorage.setItem('accessToken', 'a1');
    expect(authFacade.getToken()).toBe('a1');
  });

  it('getRefreshToken returns cookie value', () => {
    cookieUtils.set('refreshToken', 'r1', 1);
    expect(authFacade.getRefreshToken()).toBe('r1');
  });

  it('refreshToken updates access token', async () => {
    authApiMocks.refreshPost.mockResolvedValue({
      data: { accessToken: 'a2', expiresIn: 60 }
    });

    await authFacade.refreshToken();

    expect(localStorage.getItem('accessToken')).toBe('a2');
  });
});
