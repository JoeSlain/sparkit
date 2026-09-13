import { QueryClient } from '@tanstack/react-query';
import { clearAccountCache } from '../src/query';

describe('account cache boundary', () => {
  it('removes private data when another account signs in', () => {
    const cache = new QueryClient();
    cache.setQueryData(['tasks', 'alice'], [{ title: 'Private Alice task' }]);
    clearAccountCache('alice', 'bob', cache);
    expect(cache.getQueryData(['tasks', 'alice'])).toBeUndefined();
    expect(cache.getQueryCache().getAll()).toHaveLength(0);
  });
  it('keeps cached data through a same-user token refresh and clears it at logout', () => {
    const cache = new QueryClient();
    cache.setQueryData(['profile', 'alice'], { display_name: 'Alice' });
    clearAccountCache('alice', 'alice', cache);
    expect(cache.getQueryData(['profile', 'alice'])).toEqual({ display_name: 'Alice' });
    clearAccountCache('alice', null, cache);
    expect(cache.getQueryCache().getAll()).toHaveLength(0);
  });
});
