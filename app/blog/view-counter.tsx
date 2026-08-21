export default function ViewCounter({ count }: { count: number }) {
  return (
    <span className="text-muted-foreground">
      {`${count.toLocaleString()} views`}
    </span>
  );
}
