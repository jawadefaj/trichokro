import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import Features from "@/components/Features";
import About from "@/components/About";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <div id="home">
          <Hero />
        </div>
        <div id="benefits">
          <Benefits />
        </div>
        <div id="features">
          <Features />
        </div>
        <div id="about">
          <About />
        </div>
        <div id="contact">
          <Contact />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl font-bold text-primary mb-2">⚡ EcoRide</div>
          <p className="text-sm opacity-70">
            © 2024 EcoRide Bangladesh. All rights reserved. | Leading the electric revolution.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
