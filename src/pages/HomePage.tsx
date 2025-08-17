import Hero from "../components/Hero"
import Categories from "../components/Categories"
import FlowerGrid from "../components/FlowerGrid"
import { useOutletContext } from "react-router-dom";

interface OutletContext {
  searchTerm: string;
}

const HomePage = () => {

  const context = useOutletContext<OutletContext>()
  const searchTerm = context?.searchTerm || '';

  return (
    <>
      <Hero />
      <Categories />
      <FlowerGrid searchTerm={searchTerm} />
    </>
  )
}

export default HomePage
