import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "../../components/auth/AuthModalContext.tsx";
import { Categories } from "../../components/Categories/Categories.tsx";
import { Hero } from "../../components/Hero/Hero.tsx";
import { Recipes } from "../../components/Recipes/Recipes.tsx";
import { Testimonials } from "../../components/Testimonials/Testimonials.tsx";
import { selectIsAuthenticated } from "../../redux/auth/selectors.ts";
import { useAppSelector } from "../../redux/hooks.ts";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { openSignIn } = useAuthModal();
  // Обрана категорія: null — показуємо Categories, інакше на тому ж маршруті блок Recipes
  const [category, setCategory] = useState<string | null>(null);

  const handleAddRecipe = () => {
    if (isAuthenticated) {
      navigate("/recipe/add");
      return;
    }

    openSignIn("/recipe/add");
  };

  return (
    <main className={styles.page}>
      <Hero onAddRecipe={handleAddRecipe} />
      {category === null ? (
        <Categories onSelect={setCategory} />
      ) : (
        <Recipes category={category} onBack={() => setCategory(null)} />
      )}
      <Testimonials />
    </main>
  );
};

export default HomePage;
