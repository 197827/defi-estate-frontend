import { Skeleton } from "@/components/ui/Skeleton";

export default function PropertyDetailLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-9 w-3/4 max-w-md" />
          <Skeleton className="h-5 w-1/2 max-w-xs" />
        </div>

        <Skeleton className="aspect-video w-full rounded-lg" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-lg border border-border p-4"
            >
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </main>
  );
}