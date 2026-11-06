import { CardGridSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="flex-1 bg-ss-bg">
      <CardGridSkeleton count={6} withHeading />
    </div>
  );
}
