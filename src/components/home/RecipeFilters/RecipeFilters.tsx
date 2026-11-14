import { useEffect, useMemo } from "react";
import { fetchFilterOptions } from "../../../redux/filters/operations.ts";
import {
  selectAreas,
  selectIngredients,
} from "../../../redux/filters/selectors.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
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
  ...items
    .map(({ id, name }) => ({ value: id, label: name }))
    .sort((a, b) => a.label.localeCompare(b.label)),
];

export const RecipeFilters = ({
  ingredient,
  area,
  onIngredientChange,
  onAreaChange,
}: RecipeFiltersProps) => {
  const dispatch = useAppDispatch();
  const ingredients = useAppSelector(selectIngredients);
  const areas = useAppSelector(selectAreas);

  useEffect(() => {
    dispatch(fetchFilterOptions());
  }, [dispatch]);

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
