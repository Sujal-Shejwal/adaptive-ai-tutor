import Navbar from "../components/layout/Navbar";
import Hero from "../components/sections/Hero";
import Statistics from "../components/sections/Statistics";
import Features from "../components/sections/Features";
import HowItWorks from "../components/sections/HowItWorks";
import Footer from "../components/layout/Footer";

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Statistics />
      <Features />
      <HowItWorks />
      <Footer />
    </>
  );
}

export default LandingPage;