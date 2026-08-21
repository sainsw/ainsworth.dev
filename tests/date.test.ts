import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formatLongDate, formatRelativeDate, parsePostDate } from '@/lib/date';

// `formatRelativeDate` takes the clock as an argument, so every case below is a
// fixed pair rather than something computed against the real date. It used to
// read `new Date()` itself, which made it untestable without faking timers and,
// more to the point, unprerenderable under `cacheComponents`.

describe('parsePostDate', () => {
  it('reads a bare date as local midnight, not UTC midnight', () => {
    // Without the appended time a bare `2024-03-01` parses as UTC, which lands
    // on the previous day for anyone behind UTC and shows an off-by-one date.
    const parsed = parsePostDate('2024-03-01');
    expect(parsed.getFullYear()).toBe(2024);
    expect(parsed.getMonth()).toBe(2);
    expect(parsed.getDate()).toBe(1);
  });

  it('leaves a full timestamp alone', () => {
    expect(parsePostDate('2024-03-01T09:30:00Z').toISOString()).toBe(
      '2024-03-01T09:30:00.000Z',
    );
  });
});

describe('formatLongDate', () => {
  it('spells the month out', () => {
    expect(formatLongDate('2024-03-01')).toBe('March 1, 2024');
  });
});

describe('formatRelativeDate', () => {
  const now = new Date('2024-03-10T12:00:00');

  it('says Today for a post published today', () => {
    expect(formatRelativeDate('2024-03-10', now)).toBe('Today');
  });

  it('counts whole days below a month', () => {
    expect(formatRelativeDate('2024-03-09', now)).toBe('1d ago');
    expect(formatRelativeDate('2024-02-20', now)).toBe('19d ago');
  });

  it('switches to months once a calendar month has passed', () => {
    expect(formatRelativeDate('2024-02-10', now)).toBe('1mo ago');
    expect(formatRelativeDate('2023-09-10', now)).toBe('6mo ago');
  });

  it('does not count a month until the day of the month is reached', () => {
    // 11 Feb to 10 Mar is one day short of a month, so it stays in days.
    expect(formatRelativeDate('2024-02-11', now)).toBe('28d ago');
  });

  it('switches to years at twelve months', () => {
    expect(formatRelativeDate('2023-03-10', now)).toBe('1y ago');
    expect(formatRelativeDate('2021-01-05', now)).toBe('3y ago');
  });

  it('reads the clock it is given, not the real one', () => {
    expect(
      formatRelativeDate('2024-03-10', new Date('2029-03-10T12:00:00')),
    ).toBe('5y ago');
  });
});

describe('the cached clock behind those dates', () => {
  const cacheLife = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    cacheLife.mockReset();
    vi.doMock('next/cache', () => ({ cacheLife }));
  });

  it('gives the clock a bounded lifetime instead of freezing at build', async () => {
    // A bare `new Date()` in a prerendered server component is a build error
    // under `cacheComponents`, because the value would never move again. The
    // cache window is what makes reading the clock legal here.
    const { currentDate } = await import('@/lib/current-date');
    const before = Date.now();
    const value = await currentDate();

    expect(value.getTime()).toBeGreaterThanOrEqual(before);
    expect(cacheLife).toHaveBeenCalledWith('hours');
  });
});
