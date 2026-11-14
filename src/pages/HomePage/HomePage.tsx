import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Categories } from "../../components/Categories/Categories.tsx";
import { Hero } from "../../components/Hero/Hero.tsx";
import { Testimonials } from "../../components/Testimonials/Testimonials.tsx";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const navigate = useNavigate();
  // Обрана категорія: null — показуємо Categories, інакше на тому ж маршруті блок Recipes
  const [category, setCategory] = useState<string | null>(null);

  // TODO [FE-02], [FE-04]: гостю відкривати SignInModal, авторизованого вести на /recipe/add
  const handleAddRecipe = () => {
    navigate("/recipe/add");
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
