
import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="relative overflow-hidden bg-gray-50">
        <Skeleton className="w-full h-80" />
      </div>
      
      <div className="p-6">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
