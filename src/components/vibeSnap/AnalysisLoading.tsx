import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const AnalysisLoading = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 pr-4"
    >
      {/* Style Summary skeleton */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-18 rounded-full" />
          <Skeleton className="h-7 w-14 rounded-full" />
        </div>
      </div>

      {/* Color Palette skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <Skeleton className="h-20 w-full rounded-none" />
              <div className="p-3 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-2.5 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      {/* Visual Tokens skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisLoading;
