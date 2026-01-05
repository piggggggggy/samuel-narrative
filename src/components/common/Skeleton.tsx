interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-bg-tertiary ${className}`}
      aria-hidden="true"
    />
  );
}

export function PostFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-20" />
      </div>

      {/* Title input */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-12 w-full" />
      </div>

      {/* Slug input */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Excerpt textarea */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-20 w-full" />
      </div>

      {/* Content editor */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-80 w-full" />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-40 w-full" />
      </div>

      {/* Submit button */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-8 md:gap-10">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
