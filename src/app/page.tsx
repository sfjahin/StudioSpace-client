import Banner from "@/components/Banner";
import FeaturedStudios from "@/components/FeaturedStudios";
import MediumSection from "@/components/MediumSection";
import StepsSection from "@/components/StepsSection";
import HostsSection from "@/components/HostsSection";
import NewsletterSection from "@/components/NewsletterSection";
import { Suspense } from "react";
import { CardGridSkeleton } from "@/components/Skeletons";

export default function Home() {
  return (
    <div className="min-h-screen bg-ss-bg">
      <main>
        <Banner />
        <Suspense fallback={<CardGridSkeleton count={6} withHeading />}>
          <FeaturedStudios />
        </Suspense>
        <MediumSection />
        <StepsSection />
        <HostsSection />
        <NewsletterSection />
      </main>
    </div>
  );
}
