import Banner from "@/components/Banner";
import MediumSection from "@/components/MediumSection";
import StepsSection from "@/components/StepsSection";
import HostsSection from "@/components/HostsSection";
import NewsletterSection from "@/components/NewsletterSection";


export default function Home() {
  return (
    <div className="min-h-screen bg-[#fbfbfa]">

      <main>
        <Banner />
        <MediumSection />
        <StepsSection />
        <HostsSection />
        <NewsletterSection />
      </main>

    </div>
  );
}
