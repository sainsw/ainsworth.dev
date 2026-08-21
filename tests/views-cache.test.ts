import { beforeEach, describe, expect, it, vi } from 'vitest';

const sql = vi.fn();
const cacheLife = vi.fn();

beforeEach(() => {
  vi.resetModules();
  sql.mockReset();
  cacheLife.mockReset();
  vi.doMock('@/lib/db/postgres', () => ({ sql }));
  vi.doMock('next/cache', () => ({ cacheLife }));
});

const load = () => import('@/lib/views-cache');

describe('the view-count cache boundary', () => {
  it('reads every slug and count in one statement', async () => {
    sql.mockResolvedValue([{ slug: 'a', count: 1 }]);
    const { readViewRows } = await load();

    expect(await readViewRows()).toEqual([{ slug: 'a', count: 1 }]);
    expect(sql).toHaveBeenCalledTimes(1);
    expect(sql.mock.calls[0][0].join('?')).toContain('SELECT slug, count FROM');
  });

  it("coerces the driver's count to a number", async () => {
    // node-postgres hands back bigint columns as strings; a string here would
    // render as "12 views" but sort and compare as text everywhere else.
    sql.mockResolvedValue([{ slug: 'a', count: '12' }]);
    const { readViewRows } = await load();

    expect(await readViewRows()).toEqual([{ slug: 'a', count: 12 }]);
  });

  it('lets a failed read reject rather than swallowing it', async () => {
    // lib/views.ts catches on the far side of this boundary on purpose, so that
    // the rejection is never written to the cache. Handling it here would pin
    // every count at "unavailable" for the whole window. See views.test.ts.
    sql.mockRejectedValue(new Error('connection refused'));
    const { readViewRows } = await load();

    await expect(readViewRows()).rejects.toThrow('connection refused');
  });
});

/**
 * This replaces the old tests/blog-revalidate.test.ts. Both blog routes used to
 * carry `export const revalidate = 60`, without which the view counts froze at
 * build time and only moved on redeploy. `cacheComponents` rejects that
 * route-segment config outright, so the window lives here now, and this is the
 * only thing left asserting it.
 */
describe('the freshness window the blog routes used to declare', () => {
  it('revalidates the counts once a minute', async () => {
    sql.mockResolvedValue([]);
    const { readViewRows, CACHE_WINDOW_SECONDS } = await load();
    await readViewRows();

    expect(CACHE_WINDOW_SECONDS).toBe(60);
    expect(cacheLife).toHaveBeenCalledTimes(1);
    expect(cacheLife.mock.calls[0][0]).toMatchObject({ revalidate: 60 });
  });

  it('gives the entry a finite stale and expire, so a dead read cannot pin a count forever', async () => {
    sql.mockResolvedValue([]);
    const { readViewRows } = await load();
    await readViewRows();

    const profile = cacheLife.mock.calls[0][0];
    expect(Number.isFinite(profile.stale)).toBe(true);
    expect(Number.isFinite(profile.expire)).toBe(true);
    expect(profile.expire).toBeGreaterThan(profile.revalidate);
  });
});
