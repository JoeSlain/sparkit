import * as SecureStore from 'expo-secure-store';

// ASCII-encoded chunks stay below per-item limits even with Unicode metadata.
// Serialize reads/writes/deletes per key: a late refresh must not resurrect a
// session after a queued sign-out, or remove chunks another read still needs.
const chunkSize = 1500;
const operations = new Map<string, Promise<void>>();
type Manifest = { generation: string; count: number };

function serialize<T>(key: string, operation: () => Promise<T>): Promise<T> {
  const result = (operations.get(key) ?? Promise.resolve()).then(operation);
  const settled = result.then(
    () => undefined,
    () => undefined,
  );
  operations.set(key, settled);
  void settled.then(() => {
    if (operations.get(key) === settled) operations.delete(key);
  });
  return result;
}

async function manifest(key: string): Promise<Manifest | null> {
  const value = await SecureStore.getItemAsync(`${key}.manifest`);
  if (!value) return null;
  const parsed: unknown = JSON.parse(value);
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('generation' in parsed) ||
    typeof parsed.generation !== 'string' ||
    !/^[a-z0-9-]+$/.test(parsed.generation) ||
    !('count' in parsed) ||
    typeof parsed.count !== 'number' ||
    !Number.isInteger(parsed.count) ||
    parsed.count < 0 ||
    parsed.count > 100
  )
    throw new Error('Invalid secure storage manifest');
  return parsed as Manifest;
}

async function removeChunks(key: string, previous: Manifest | null) {
  if (previous)
    await Promise.all(
      Array.from({ length: previous.count }, (_, index) =>
        SecureStore.deleteItemAsync(`${key}.${previous.generation}.${index}`),
      ),
    );
}

export const secureStorage = {
  getItem(key: string): Promise<string | null> {
    return serialize(key, async () => {
      const current = await manifest(key);
      if (!current) return null;
      const chunks = await Promise.all(
        Array.from({ length: current.count }, (_, index) =>
          SecureStore.getItemAsync(`${key}.${current.generation}.${index}`),
        ),
      );
      if (chunks.some((chunk) => chunk === null)) return null;
      return decodeURIComponent(chunks.join(''));
    });
  },
  setItem(key: string, value: string): Promise<void> {
    return serialize(key, async () => {
      const previous = await manifest(key);
      const generation = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const chunks =
        encodeURIComponent(value).match(new RegExp(`[\\s\\S]{1,${chunkSize}}`, 'g')) ?? [];
      if (chunks.length > 100) throw new Error('Session exceeds secure storage capacity');
      const next = { generation, count: chunks.length };
      try {
        // Wait for every write before cleanup, including when one write fails.
        const writes = await Promise.allSettled(
          chunks.map((chunk, index) =>
            SecureStore.setItemAsync(`${key}.${generation}.${index}`, chunk, {
              keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            }),
          ),
        );
        const failure = writes.find((write) => write.status === 'rejected');
        if (failure?.status === 'rejected') throw failure.reason;
        await SecureStore.setItemAsync(`${key}.manifest`, JSON.stringify(next), {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
      } catch (error) {
        await removeChunks(key, next).catch(() => undefined);
        throw error;
      }
      await removeChunks(key, previous);
    });
  },
  removeItem(key: string): Promise<void> {
    return serialize(key, async () => {
      const current = await manifest(key);
      await SecureStore.deleteItemAsync(`${key}.manifest`);
      await removeChunks(key, current);
    });
  },
};
