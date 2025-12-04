import { useEffect, useState } from "react";
import { startOfMonth, endOfMonth, formatISO } from "date-fns";
import { FILTERS_KEY, SESSION_KEY } from "@/constants/storageKeys";

export const initializeSession = () => {
  const sessionId = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, sessionId);
};

const isSameSession = (): boolean => {
  const savedSession = localStorage.getItem(SESSION_KEY);
  return Boolean(savedSession);
};


export const usePersistedFilters = () => {
  const today = new Date();

  const defaultFilters = {
    fullName: "",
    startDate: formatISO(startOfMonth(today), { representation: "date" }),
    endDate: formatISO(endOfMonth(today), { representation: "date" }),
  };

  const [filters, setFilters] = useState<typeof defaultFilters>(() => {
    if (!isSameSession()) {
      return defaultFilters;
    }

    const saved = localStorage.getItem(FILTERS_KEY);
    if (!saved) {
      return defaultFilters;
    }

    try {
      const parsed = JSON.parse(saved);

      if (
        parsed &&
        typeof parsed === "object" &&
        typeof parsed.fullName === "string" &&
        typeof parsed.startDate === "string" &&
        typeof parsed.endDate === "string"
      ) {
        return {
          fullName: parsed.fullName,
          startDate: parsed.startDate,
          endDate: parsed.endDate,
        };
      }
    } catch {
      console.warn("Повреждены сохранённые фильтры — сброшены на значения по умолчанию");
    }

    return defaultFilters;
  });

  useEffect(() => {
    try {
      localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Не удалось сохранить фильтры в localStorage:", error);
    }
  }, [filters]);

  return [filters, setFilters] as const;
};
