import { beforeEach, describe, expect, it, vi } from 'vitest';

const sql = vi.fn();

/**
 * A stand-in for the `use cache` boundary in lib/views-cache.ts that caches
 * *resolutions only*, which is the behaviour the module's catch placement
 * depends on. A fake that also cached rejections would make the "retries after
 * a failure" test pass either way.
 *
 * Next's default cache handler drains the entry's stream inside a try/catch and
 * only writes to the cache once the stream ends cleanly, so a `use cache`
 * function that rejects leaves nothing behind. That is the property being
 * modelled here.
 */
function memoiseResolved<T>(fn: () => Promise<T>) {
  let cached: T;
  let hasCached = false;
  return async () => {
    if (hasCached) return cached;
    cached = await fn();
    hasCached = true;
    return cached;
  };
}

const origEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  sql.mockReset();
  process.env = { ...origEnv };
  vi.doMock('@/lib/db/postgres', () => ({ sql }));
  // `use cache` is a compiler directive, so under vitest lib/views-cache.ts runs
  // with no caching at all. Wrapping the real export keeps its query and its row
  // mapping under test while putting a fake cache boundary where the real one is.
  vi.doMock('@/lib/views-cache', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/views-cache')>();
    return { ...actual, readViewRows: memoiseResolved(actual.readViewRows) };
  });
  vi.doMock('next/cache', () => ({ cacheLife: vi.fn() }));
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

const load = () => import('@/lib/views');

describe('without a database configured', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = '';
  });

  it('reports counts as unavailable rather than zero', async () => {
    const { getViewCount } = await load();
    expect(await getViewCount('hello-world')).toBeNull();
  });

  it('reports every requested slug as unavailable', async () => {
    const { getViewCounts } = await load();
    const counts = await getViewCounts(['a', 'b']);
    expect([...counts.entries()]).toEqual([
      ['a', null],
      ['b', null],
    ]);
  });

  it('never issues a query', async () => {
    const { getViewCount, recordView } = await load();
    await getViewCount('hello-world');
    expect(await recordView('hello-world')).toBe('unavailable');
    expect(sql).not.toHaveBeenCalled();
  });
});

describe('with a database', () => {
  beforeEach(() => {
    process.env.DATABASE_URL = 'postgres://localhost/test';
  });

  it('returns the stored count for a known slug', async () => {
    sql.mockResolvedValue([{ slug: 'hello-world', count: 42 }]);
    const { getViewCount } = await load();
    expect(await getViewCount('hello-world')).toBe(42);
  });

  it('returns zero — not null — for a post with no row yet', async () => {
    sql.mockResolvedValue([{ slug: 'other', count: 3 }]);
    const { getViewCount } = await load();
    expect(await getViewCount('hello-world')).toBe(0);
  });

  it('answers a bulk read from a single query', async () => {
    sql.mockResolvedValue([
      { slug: 'a', count: 1 },
      { slug: 'b', count: 2 },
    ]);
    const { getViewCounts } = await load();
    const counts = await getViewCounts(['a', 'b', 'c']);

    expect([...counts.entries()]).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 0],
    ]);
    expect(sql).toHaveBeenCalledTimes(1);
  });

  it('reports a failed read as unavailable', async () => {
    sql.mockRejectedValue(new Error('connection refused'));
    const { getViewCount } = await load();
    expect(await getViewCount('hello-world')).toBeNull();
  });

  it('retries after a failed read instead of caching the failure', async () => {
    sql.mockRejectedValueOnce(new Error('connection refused'));
    sql.mockResolvedValueOnce([{ slug: 'hello-world', count: 7 }]);
    const { getViewCount } = await load();

    expect(await getViewCount('hello-world')).toBeNull();
    // The catch sits outside the cache, so the rejection was never stored.
    expect(await getViewCount('hello-world')).toBe(7);
  });

  it('caches a successful read for the window', async () => {
    sql.mockResolvedValue([{ slug: 'hello-world', count: 7 }]);
    const { getViewCount } = await load();

    await getViewCount('hello-world');
    await getViewCount('hello-world');
    expect(sql).toHaveBeenCalledTimes(1);
  });

  it('records a view', async () => {
    sql.mockResolvedValue(undefined);
    const { recordView } = await load();
    expect(await recordView('hello-world')).toBe('recorded');
    expect(sql).toHaveBeenCalledTimes(1);
  });

  it('reports a failed write as unavailable rather than throwing', async () => {
    sql.mockRejectedValue(new Error('connection refused'));
    const { recordView } = await load();
    expect(await recordView('hello-world')).toBe('unavailable');
  });
});
