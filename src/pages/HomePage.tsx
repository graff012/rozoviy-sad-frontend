import Hero from "../components/Hero"
import Categories from "../components/Categories"
import FlowerGrid from "../components/FlowerGrid"
import { useOutletContext, useLocation } from "react-router-dom";
import { useEffect } from "react";

interface OutletContext {
  searchTerm: string;
}

const HomePage = () => {

  const context = useOutletContext<OutletContext>()
  const searchTerm = context?.searchTerm || '';
  const location = useLocation();

  // Scroll to flowers section if URL hash is present
  useEffect(() => {
    if (location.hash === "#flowers-section") {
      const el = document.getElementById("flowers-section");
      if (el) {
        // use a timeout to ensure the section is rendered
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
      }
    }
  }, [location.hash]);

  return (
    <>
      <Hero />
      <Categories />
      <FlowerGrid searchTerm={searchTerm} />
    </>
  )
}

export default HomePage
