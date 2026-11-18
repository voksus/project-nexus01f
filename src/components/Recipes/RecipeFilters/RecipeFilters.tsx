import { useMemo } from "react";
import { useReferences } from "../../../hooks/useReferences.ts";
import { Select, type SelectOption } from "../../ui/Select/Select.tsx";
import styles from "./RecipeFilters.module.css";

interface RecipeFiltersProps {
  ingredient: string;
  area: string;
  onIngredientChange: (ingredient: string) => void;
  onAreaChange: (area: string) => void;
}

const toOptions = (
  items: { id: string; name: string }[],
  allLabel: string,
): SelectOption[] => [
  { value: "", label: allLabel },
  ...items.map(({ id, name }) => ({ value: id, label: name })),
];

export const RecipeFilters = ({
  ingredient,
  area,
  onIngredientChange,
  onAreaChange,
}: RecipeFiltersProps) => {
  const { items: ingredients } = useReferences("ingredients");
  const { items: areas } = useReferences("areas");

  const ingredientOptions = useMemo(
    () => toOptions(ingredients, "All ingredients"),
    [ingredients],
  );
  const areaOptions = useMemo(() => toOptions(areas, "All areas"), [areas]);

  return (
    <div className={styles.filters}>
      <Select
        options={ingredientOptions}
        value={ingredient}
        placeholder="Ingredients"
        onChange={onIngredientChange}
      />
      <Select
        options={areaOptions}
        value={area}
        placeholder="Area"
        onChange={onAreaChange}
      />
    </div>
  );
};
