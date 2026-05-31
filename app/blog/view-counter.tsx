export default function ViewCounter({
  slug,
  allViews,
}: {
  slug: string;
  allViews: {
    slug: string;
    count: number;
  }[];
}) {
  const viewsForSlug = allViews?.find((view) => view.slug === slug);
  const count = viewsForSlug?.count ?? 0;

  return (
    <span className="text-muted-foreground">
      {`${count.toLocaleString()} views`}
    </span>
  );
}
