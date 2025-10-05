import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { CategorySection } from "@/components/home/CategorySection";
import { StatsSection } from "@/components/home/StatsSection";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedProjects />
        <CategorySection />
        <StatsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
