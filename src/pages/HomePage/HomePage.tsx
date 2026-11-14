import { useNavigate } from "react-router-dom";
import { Hero } from "../../components/Hero/Hero.tsx";
import { Testimonials } from "../../components/Testimonials/Testimonials.tsx";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const navigate = useNavigate();

  // TODO [FE-02], [FE-04]: гостю відкривати SignInModal, авторизованого вести на /recipe/add
  const handleAddRecipe = () => {
    navigate("/recipe/add");
  };

  return (
    <main className={styles.page}>
      <Hero onAddRecipe={handleAddRecipe} />
      {/* TODO [FE-05]: Categories; [FE-06]: Recipes */}
      <Testimonials />
    </main>
  );
};

export default HomePage;
