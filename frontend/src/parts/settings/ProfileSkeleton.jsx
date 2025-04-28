import { Skeleton } from "@/components/ui/skeleton";


const ProfileSkeleton = () => {
  return (
    <>
    <div className="flex flex-col sm:flex-row items-center mb-6">
      {/* Profile Image Skeleton */}
      <Skeleton className="rounded-full w-20 h-20 mr-4" />
      
      <div>
        <div className="mb-1">
          <Skeleton className="h-6 w-32 mt-1"  />
        </div>

        <div className="mt-2">
          <Skeleton className="h-5 w-48 mt-1" />
        </div>
      </div>
    </div>
    <Skeleton className="h-10 w-3full sm:w-auto rounded" />
    </>
  );
};

export default ProfileSkeleton;
