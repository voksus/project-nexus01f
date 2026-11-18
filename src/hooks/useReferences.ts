import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks.ts";
import {
  type ReferenceKey,
  referenceThunks,
} from "../redux/references/operations.ts";

/** Loads a reference list once and returns its cached state */
export const useReferences = <K extends ReferenceKey>(key: K) => {
  const dispatch = useAppDispatch();
  const list = useAppSelector((state) => state.references[key]);

  const load = useCallback(() => {
    void dispatch(referenceThunks[key]());
  }, [dispatch, key]);

  useEffect(load, [load]);

  return { ...list, retry: load };
};
