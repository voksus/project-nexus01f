import clsx from "clsx";
import { AddRecipeForm } from "../../components/AddRecipeForm/AddRecipeForm.tsx";
import { MainTitle } from "../../components/ui/MainTitle/MainTitle.tsx";
import { PathInfo } from "../../components/ui/PathInfo/PathInfo.tsx";
import { Subtitle } from "../../components/ui/Subtitle/Subtitle.tsx";
import styles from "./AddRecipePage.module.css";

const AddRecipePage = () => {
  return (
    <main className={clsx("container", styles.page)}>
      <PathInfo current="Add recipe" />
      <div className={styles.heading}>
        <MainTitle as="h1">Add recipe</MainTitle>
        <Subtitle className={styles.subtitle}>
          Reveal your culinary art, share your favorite recipe and create
          gastronomic masterpieces with us.
        </Subtitle>
      </div>
      <AddRecipeForm />
    </main>
  );
};

export default AddRecipePage;
