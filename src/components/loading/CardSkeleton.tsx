import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  className?: string;
}

const CardSkeleton = ({ className = "" }: CardSkeletonProps) => {
  return (
    <div className={`cyber-card space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 animate-pulse rounded-md" />
        <Skeleton className="h-5 w-5 rounded-full animate-pulse" />
      </div>
      <Skeleton className="h-4 w-full animate-pulse rounded-md" style={{ animationDelay: "100ms" }} />
      <Skeleton className="h-4 w-3/4 animate-pulse rounded-md" style={{ animationDelay: "200ms" }} />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 animate-pulse rounded-md" style={{ animationDelay: "300ms" }} />
        <Skeleton className="h-8 w-20 animate-pulse rounded-md" style={{ animationDelay: "400ms" }} />
      </div>
    </div>
  );
};

export default CardSkeleton;
