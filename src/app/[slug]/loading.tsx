/**
 * Post detail page loading skeleton
 * Shows while the post content is loading
 */
export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-4 animate-pulse">
      <article>
        {/* Header */}
        <header className="mb-8">
          {/* Tags Skeleton */}
          <div className="mb-2 flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 bg-gray-200 rounded-full" />
            ))}
          </div>

          {/* Title Skeleton */}
          <div className="h-10 bg-gray-200 rounded w-4/5 mb-4" />

          {/* Meta Info Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-12 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
        </header>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-6" />

        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-6 bg-gray-200 rounded w-5/6" />
          <div className="h-6 bg-gray-200 rounded w-4/5" />
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />

          {/* Image placeholder */}
          <div className="h-64 bg-gray-200 rounded-lg my-8" />

          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-6 bg-gray-200 rounded w-4/5" />
          <div className="h-6 bg-gray-200 rounded w-5/6" />
        </div>
      </article>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-12" />

      {/* Comments Section Skeleton */}
      <div className="mt-12">
        <div className="h-7 bg-gray-200 rounded w-24 mb-6" />

        {/* Comment Skeletons */}
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
