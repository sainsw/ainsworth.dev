import Link from 'next/link';
import { formatRelativeDate } from '@/lib/date';
import type { ViewCount } from '@/lib/views';
import ViewCounter from './view-counter';

export type BlogRowPost = {
  slug: string;
  metadata: { title: string; publishedAt: string };
};

/**
 * One row of the blog index. `viewCount` is undefined while the counts are
 * still in flight and null when the counter is unavailable; both render the
 * same reserved space, so the row does not resize when the number arrives.
 */
export function BlogRow({
  post,
  viewCount,
}: {
  post: BlogRowPost;
  viewCount?: ViewCount;
}) {
  return (
    <Link
      className="flex flex-col space-y-1 mb-4 group"
      href={`/blog/${post.slug}`}
    >
      <div className="w-full flex flex-col">
        <p className="text-foreground tracking-tight group-hover:text-muted-foreground transition-colors">
          {post.metadata.title}
        </p>
        {typeof viewCount === 'number' ? (
          <p className="text-muted-foreground">
            <em>{formatRelativeDate(post.metadata.publishedAt)}</em> &mdash;{' '}
            <ViewCounter count={viewCount} />
          </p>
        ) : (
          <p className="h-6" />
        )}
      </div>
    </Link>
  );
}
