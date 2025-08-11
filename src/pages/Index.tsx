import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Workflow from "@/components/Workflow";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Services />
        <Workflow />
        <Stats />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
