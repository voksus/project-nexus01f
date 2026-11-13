import { useNavigate } from "react-router-dom";
import { Hero } from "../../components/Hero/Hero.tsx";

const HomePage = () => {
  const navigate = useNavigate();

  // TODO [FE-02], [FE-04]: гостю відкривати SignInModal, авторизованого вести на /recipe/add
  const handleAddRecipe = () => {
    navigate("/recipe/add");
  };

  return (
    <main>
      <Hero onAddRecipe={handleAddRecipe} />
      {/* TODO [FE-05]: Categories, Testimonials; [FE-06]: Recipes */}
    </main>
  );
};

export default HomePage;
