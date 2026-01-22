import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  className?: string;
  height?: string;
}

const ChartSkeleton = ({ className = "", height = "h-64" }: ChartSkeletonProps) => {
  return (
    <div className={`cyber-card space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40 animate-pulse rounded-md" />
          <Skeleton className="h-4 w-24 animate-pulse rounded-md" style={{ animationDelay: "100ms" }} />
        </div>
        <Skeleton className="h-5 w-5 rounded-full animate-pulse" />
      </div>
      <div className={`${height} flex items-end justify-center gap-2`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full animate-pulse rounded-t-md"
            style={{ 
              height: `${Math.random() * 60 + 40}%`,
              animationDelay: `${i * 100}ms`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ChartSkeleton;
