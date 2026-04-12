import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import ServicesSection from "@/components/public/ServicesSection";
import WhyUsSection from "@/components/public/WhyUsSection";
import ProcessSection from "@/components/public/ProcessSection";
import PricingSection from "@/components/public/PricingSection";
import CTABanner from "@/components/public/CTABanner";
import Footer from "@/components/public/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <HeroSection />
    <ServicesSection />
    <WhyUsSection />
    <ProcessSection />
    <PricingSection />
    <CTABanner />
    <Footer />
  </div>
);

export default Index;
