import * as SecureStore from 'expo-secure-store';
import { secureStorage } from '../src/secure-storage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'device',
}));
const values = new Map<string, string>();
beforeEach(() => {
  values.clear();
  jest.clearAllMocks();
  jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key) => values.get(key) ?? null);
  jest.mocked(SecureStore.setItemAsync).mockImplementation(async (key, value) => {
    values.set(key, value);
  });
  jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => {
    values.delete(key);
  });
});
it('round-trips a large session and removes every encrypted chunk at logout', async () => {
  const session = JSON.stringify({ access_token: 'a'.repeat(6000), name: 'Élodie 🪴' });
  await secureStorage.setItem('session', session);
  expect(await secureStorage.getItem('session')).toBe(session);
  expect([...values.values()].every((value) => value.length <= 1500)).toBe(true);
  await secureStorage.removeItem('session');
  expect(await secureStorage.getItem('session')).toBeNull();
  expect(values.size).toBe(0);
});
it('replaces previous chunks without leaving old tokens', async () => {
  await secureStorage.setItem('session', 'old'.repeat(1200));
  await secureStorage.setItem('session', 'new');
  expect(await secureStorage.getItem('session')).toBe('new');
  expect(values.size).toBe(2);
});
it('does not expose a partially-written replacement session', async () => {
  await secureStorage.setItem('session', 'valid-session');
  jest.mocked(SecureStore.setItemAsync).mockRejectedValueOnce(new Error('Keychain unavailable'));
  await expect(secureStorage.setItem('session', 'replacement')).rejects.toThrow(
    'Keychain unavailable',
  );
  expect(await secureStorage.getItem('session')).toBe('valid-session');
});

it('does not resurrect a session when sign-out overlaps an in-flight refresh', async () => {
  let release!: () => void;
  let started!: () => void;
  const writing = new Promise<void>((resolve) => {
    started = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  jest.mocked(SecureStore.setItemAsync).mockImplementationOnce(async (key, value) => {
    started();
    await gate;
    values.set(key, value);
  });
  const refresh = secureStorage.setItem('session', 'refreshed-session');
  await writing;
  const signOut = secureStorage.removeItem('session');
  release();
  await Promise.all([refresh, signOut]);
  expect(await secureStorage.getItem('session')).toBeNull();
  expect(values.size).toBe(0);
});

it('cleans partial failed writes and lets a later sign-in recover', async () => {
  await secureStorage.setItem('session', 'previous');
  jest.mocked(SecureStore.setItemAsync).mockRejectedValueOnce(new Error('Disk full'));
  await expect(secureStorage.setItem('session', 'replacement'.repeat(1000))).rejects.toThrow(
    'Disk full',
  );
  expect(values.size).toBe(2);
  await secureStorage.setItem('session', 'next-user');
  expect(await secureStorage.getItem('session')).toBe('next-user');
  expect(values.size).toBe(2);
});
