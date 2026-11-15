import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Categories } from "../../components/Categories/Categories.tsx";
import { Hero } from "../../components/Hero/Hero.tsx";
import { Testimonials } from "../../components/Testimonials/Testimonials.tsx";
import { selectIsAuthenticated } from "../../redux/auth/selectors.ts";
import { useAppSelector } from "../../redux/hooks.ts";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  // Обрана категорія: null — показуємо Categories, інакше на тому ж маршруті блок Recipes
  const [category, setCategory] = useState<string | null>(null);

  const handleAddRecipe = () => {
    if (isAuthenticated) {
      navigate("/recipe/add");
      return;
    }
    // TODO [FE-04]: відкривати SignInModal; після входу модалка поверне на /recipe/add через state.from
  };

  return (
    <main className={styles.page}>
      <Hero onAddRecipe={handleAddRecipe} />
      {category === null ? (
        <Categories onSelect={setCategory} />
      ) : (
        // TODO [FE-06]: <Recipes category={category} onBack={() => setCategory(null)} />
        <button type="button" onClick={() => setCategory(null)}>
          Back to categories ({category})
        </button>
      )}
      <Testimonials />
    </main>
  );
};

export default HomePage;
